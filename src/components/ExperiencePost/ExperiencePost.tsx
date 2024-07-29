import {
  SearchIcon,
  XCircleIcon,
  PlusCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/solid';

import React, { useState, useEffect, useRef } from 'react';

import { useRouter } from 'next/router';

import {
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  OutlinedInput,
  SvgIcon,
  TextField,
  Typography,
} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  Autocomplete,
  AutocompleteChangeReason,
  AutocompleteRenderOptionState,
} from '@material-ui/lab';

import {
  ExperienceProps,
  VisibilityItem,
  Tag,
  SelectedUserIds,
} from '../../interfaces/experience';
import { People } from '../../interfaces/people';
import { Dropzone } from '../atoms/Dropzone';
import { ListItemPeopleComponent } from '../atoms/ListItem/ListItemPeople';
import { Loading } from '../atoms/Loading';
import ShowIf from '../common/show-if.component';
import { useStyles } from './Experience.styles';

import { debounce, isEmpty } from 'lodash';
import { useExperienceHook } from 'src/hooks/use-experience-hook';
import { useSearchHook } from 'src/hooks/use-search.hooks';
import { User } from 'src/interfaces/user';
import * as UserAPI from 'src/lib/api/user';
import i18n from 'src/locale';

type ExperienceEditorProps = {
  type?: 'Clone' | 'Edit' | 'Create';
  isEdit?: boolean;
  experience?: ExperienceProps;
  tags: Tag[];
  people: People[];
  onSearchTags: (query: string) => void;
  onSearchPeople: (query: string) => void;
  onSave: (experience: ExperienceProps) => void;
  onImageUpload: (files: File[]) => Promise<string>;
  onSearchUser?: (query: string) => void;
  users?: User[];
  onCancel?: () => void;
};

enum TagsProps {
  ALLOWED = 'allowed',
  PROHIBITED = 'prohibited',
}

const DEFAULT_EXPERIENCE: ExperienceProps = {
  name: '',
  allowedTags: [],
  people: [],
  prohibitedTags: [],
  visibility: '',
  selectedUserIds: [],
};

export const ExperiencePost: React.FC<ExperienceEditorProps> = props => {
  const {
    experience = DEFAULT_EXPERIENCE,
    people,
    tags,
    onSave,
    onImageUpload,
    onSearchTags,
    onSearchPeople,
    onSearchUser,
    users,
    onCancel,
  } = props;
  const styles = useStyles();

  const { loadPostExperience } = useExperienceHook();
  const router = useRouter();
  const { clearUsers } = useSearchHook();

  const ref = useRef(null);
  const [newExperience, setNewExperience] =
    useState<ExperienceProps>(experience);
  const [image, setImage] = useState<string | undefined>(
    experience.experienceImageURL,
  );
  const [, setDetailChanged] = useState<boolean>(false);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [selectedVisibility, setSelectedVisibility] =
    useState<VisibilityItem>();
  const [selectedUserIds, setSelectedUserIds] = useState<User[]>([]);
  const [pageUserIds, setPageUserIds] = React.useState<number>(1);
  const [isLoadingSelectedUser, setIsLoadingSelectedUser] =
    useState<boolean>(false);
  const [errors, setErrors] = useState({
    name: false,
    picture: false,
    tags: false,
    people: false,
    visibility: false,
    selectedUserId: false,
  });

  useEffect(() => {
    const experienceId = router.query.experienceId as string | null;
    if (experienceId) {
      loadPostExperience(experienceId);
    }
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      validateExperience();
    }
  }, [isSubmitted, newExperience]);

  const handleSearchTags = (event: React.ChangeEvent<HTMLInputElement>) => {
    const debounceSubmit = debounce(() => {
      onSearchTags(event.target.value);
    }, 300);

    debounceSubmit();
  };

  const handleSearchPeople = (event: React.ChangeEvent<HTMLInputElement>) => {
    const debounceSubmit = debounce(() => {
      onSearchPeople(event.target.value);
    }, 300);

    debounceSubmit();
  };

  const clearSearchedPeople = () => {
    const debounceSubmit = debounce(() => {
      onSearchPeople('');
    }, 300);

    debounceSubmit();
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length > 0) {
      setIsloading(true);
      const url = await onImageUpload(files);

      setIsloading(false);
      setImage(url);
      setNewExperience({ ...newExperience, experienceImageURL: url });
    } else {
      setNewExperience({ ...newExperience, experienceImageURL: undefined });
    }

    setDetailChanged(true);
  };

  const handleChange =
    (field: keyof ExperienceProps) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trimStart();

      setNewExperience(prevExperience => ({
        ...prevExperience,
        [field]: value,
      }));

      setDetailChanged(experience[field] !== value);
    };

  const handleTagsInputChange = (
    // eslint-disable-next-line @typescript-eslint/ban-types
    event: React.ChangeEvent<{}>,
    newValue: string,
    type: TagsProps,
  ) => {
    const options = newValue.split(/[ ,]+/);

    let tmpTags: string[] = [];
    if (type === TagsProps.ALLOWED) {
      tmpTags = newExperience.allowedTags;
    } else if (type === TagsProps.PROHIBITED) {
      tmpTags = newExperience.prohibitedTags ?? [];
    }

    const fieldValue = tmpTags
      .concat(options)
      .map(x => x.trim())
      .filter(x => x);

    if (options.length > 1) {
      handleTagsChange(event, fieldValue, 'create-option', type);
    }
  };

  const handleTagsChange = (
    // eslint-disable-next-line @typescript-eslint/ban-types
    event: React.ChangeEvent<{}>,
    value: string[],
    reason: AutocompleteChangeReason,
    type: TagsProps,
  ) => {
    const data = [...new Set(value.map(tag => tag.replace('#', '')))];

    const prohibitedTagsChanged =
      type === TagsProps.PROHIBITED &&
      (data.filter(
        tag =>
          !experience?.prohibitedTags ||
          !experience.prohibitedTags.includes(tag),
      ).length > 0 ||
        experience?.prohibitedTags?.length !== data.length);
    const allowedTagsChanged =
      type === TagsProps.ALLOWED &&
      (data.filter(tag => !experience.allowedTags.includes(tag)).length > 0 ||
        data.length !== experience.allowedTags.length);

    setDetailChanged(prohibitedTagsChanged || allowedTagsChanged);

    if (reason === 'remove-option') {
      if (type === TagsProps.ALLOWED) {
        setNewExperience(prevExperience => ({
          ...prevExperience,
          allowedTags: data,
        }));
      } else if (type === TagsProps.PROHIBITED) {
        setNewExperience(prevExperience => ({
          ...prevExperience,
          prohibitedTags: data,
        }));
      }
    }

    if (reason === 'create-option') {
      if (type === TagsProps.ALLOWED) {
        setNewExperience(prevExperience => ({
          ...prevExperience,
          allowedTags: data,
        }));
      } else if (type === TagsProps.PROHIBITED) {
        setNewExperience(prevExperience => ({
          ...prevExperience,
          prohibitedTags: data,
        }));
      }
    }

    if (reason === 'select-option') {
      if (type === TagsProps.ALLOWED) {
        setNewExperience(prevExperience => ({
          ...prevExperience,
          allowedTags: data,
        }));
      } else if (type === TagsProps.PROHIBITED) {
        setNewExperience(prevExperience => ({
          ...prevExperience,
          prohibitedTags: data,
        }));
      }
    }
  };

  const handlePeopleChange = (
    // eslint-disable-next-line @typescript-eslint/ban-types
    event: React.ChangeEvent<{}>,
    value: People[],
    reason: AutocompleteChangeReason,
  ) => {
    const people = newExperience?.people ? newExperience.people : [];
    if (reason === 'select-option') {
      setNewExperience(prevExperience => ({
        ...prevExperience,
        people: [
          ...people,
          ...value.filter(option => people.indexOf(option) === -1),
        ],
      }));
      clearSearchedPeople();
    }

    setDetailChanged(true);
  };

  const removeSelectedPeople = (selected: People) => () => {
    setNewExperience(prevExperience => ({
      ...prevExperience,
      people: prevExperience?.people
        ? prevExperience?.people.filter(people => people.id != selected.id)
        : [],
    }));

    setDetailChanged(true);
  };

  const validateExperience = (): boolean => {
    const validName = newExperience.name.length > 0;
    // const validPicture = Boolean(newExperience.experienceImageURL);
    const validTags = newExperience.allowedTags.length >= 0;
    const validPeople =
      newExperience.people.filter(people => !isEmpty(people.id)).length >= 0;
    const validSelectedUserIds =
      selectedVisibility && selectedVisibility?.id === 'selected_user'
        ? selectedUserIds.length > 0
        : !isEmpty(selectedVisibility?.id);
    const validVisibility = !isEmpty(selectedVisibility?.id);

    setErrors({
      name: !validName,
      picture: false,
      tags: !validTags,
      people: !validPeople,
      visibility: !validVisibility,
      selectedUserId: !validSelectedUserIds,
    });

    return (
      validName &&
      validTags &&
      validPeople &&
      validVisibility &&
      validSelectedUserIds
    );
  };

  const saveExperience = () => {
    setIsSubmitted(true);

    const valid = validateExperience();

    if (valid) {
      onSave(newExperience);
    } else {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const visibilityList: VisibilityItem[] = [
    {
      id: 'public',
      name: i18n.t('Experience.Editor.Visibility.Public'),
    },
    {
      id: 'private',
      name: i18n.t('Experience.Editor.Visibility.OnlyMe'),
    },
    {
      id: 'selected_user',
      name: i18n.t('Experience.Editor.Visibility.Custom'),
    },
    {
      id: 'friend',
      name: i18n.t('Experience.Editor.Visibility.Friend_Only'),
    },
  ];

  const handleVisibilityChange = (
    // eslint-disable-next-line @typescript-eslint/ban-types
    event: React.ChangeEvent<{}>,
    value: VisibilityItem,
    reason: AutocompleteChangeReason,
  ) => {
    setSelectedVisibility(value);
    setNewExperience(prevExperience => ({
      ...prevExperience,
      visibility: value?.id,
    }));

    setDetailChanged(true);
  };

  const handleSearchUser = (event: React.ChangeEvent<HTMLInputElement>) => {
    const debounceSubmit = debounce(() => {
      onSearchUser(event.target.value);
    }, 300);

    debounceSubmit();
  };

  const clearSearchedUser = () => {
    const debounceSubmit = debounce(() => {
      onSearchUser('');
    }, 300);

    debounceSubmit();
  };

  const handleVisibilityPeopleChange = (
    // eslint-disable-next-line @typescript-eslint/ban-types
    event: React.ChangeEvent<{}>,
    value: User[],
    reason: AutocompleteChangeReason,
  ) => {
    const people = selectedUserIds ? selectedUserIds : [];
    console.log({ value });
    if (reason === 'select-option') {
      setSelectedUserIds([
        ...people,
        ...value.filter(option => people.indexOf(option) === -1),
      ]);
      clearSearchedUser();
      clearUsers();
    }

    setDetailChanged(true);
  };

  const removeVisibilityPeople = (selected: User) => () => {
    setSelectedUserIds(
      selectedUserIds
        ? selectedUserIds.filter(people => people.id != selected.id)
        : [],
    );

    setDetailChanged(true);
  };

  const mappingUserIds = () => {
    console.log({ selectedVisibility });
    if (selectedVisibility?.id === 'selected_user') {
      const timestamp = Date.now();
      const mapIds = Object.values(
        selectedUserIds.map(option => {
          return {
            userId: option.id,
            addedAt: timestamp,
          };
        }),
      );
      setNewExperience(prevExperience => ({
        ...prevExperience,
        selectedUserIds: mapIds,
      }));
    } else {
      setNewExperience(prevExperience => ({
        ...prevExperience,
        selectedUserIds: [],
      }));
    }
  };

  useEffect(() => {
    mappingUserIds();
    setDetailChanged(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserIds, experience]);

  const getSelectedIds = async (selected: SelectedUserIds[]) => {
    setIsLoadingSelectedUser(true);
    const userIds = selected.map(e => e.userId);
    const response = await UserAPI.getUserByIds(userIds, pageUserIds);
    setSelectedUserIds([
      ...selectedUserIds,
      ...(response?.data as unknown as User[]),
    ]);
    setIsLoadingSelectedUser(false);
    if (pageUserIds < response.meta.totalPageCount)
      setPageUserIds(pageUserIds + 1);
  };

  React.useEffect(() => {
    getSelectedIds(experience?.selectedUserIds);
  }, [experience, pageUserIds]);

  useEffect(() => {
    if (experience) {
      const visibility = visibilityList.find(
        option => option.id === experience?.visibility,
      );
      setSelectedVisibility(visibility);

      getSelectedIds(experience?.selectedUserIds);
    }
  }, [experience]);

  return (
    <div className={styles.root} ref={ref}>
      <div className={styles.header}>
        <FormControl
          classes={{ root: styles.formControl }}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginLeft: 'auto',
          }}>
          <Typography
            variant="h5"
            color="primary"
            onClick={saveExperience}
            style={{ cursor: 'pointer' }}>
            Save
          </Typography>
          <Typography
            variant="h5"
            style={{ color: 'red', marginLeft: 10, cursor: 'pointer' }}
            onClick={onCancel}>
            Cancel
          </Typography>
        </FormControl>
      </div>
      <div className={styles.content}>
        <div className={styles.row1}>
          <FormControl
            fullWidth
            variant="outlined"
            style={{ position: 'relative', zIndex: 100 }}
            error={errors.picture}>
            <Dropzone
              error={errors.picture}
              onImageSelected={handleImageUpload}
              value={image}
              border="solid"
              maxSize={3}
              width={100}
              height={100}
              usage="experience"
              label={i18n.t('Dropzone.Btn.Exp_Add')}
            />
            <ShowIf condition={isLoading}>
              <div className={styles.loading}>
                <CircularProgress size={32} color="primary" />
              </div>
            </ShowIf>
          </FormControl>
        </div>
        <div className={styles.row2}>
          <FormControl fullWidth variant="outlined" error={errors.name}>
            <InputLabel htmlFor="experience-name">
              {i18n.t('Experience.Editor.Subtitle_1')}
            </InputLabel>
            <OutlinedInput
              id="experience-name"
              placeholder={i18n.t('Experience.Editor.Subtitle_1')}
              value={newExperience?.name || ''}
              onChange={handleChange('name')}
              labelWidth={110}
              inputProps={{ maxLength: 50 }}
            />
            <FormHelperText id="experience-name-error">
              {i18n.t('Experience.Editor.Helper.Name')}
            </FormHelperText>
            <Typography variant="subtitle1" className={styles.counter}>
              {newExperience?.name.length ?? 0}/50
            </Typography>
          </FormControl>

          <Autocomplete
            id="experience-visibility"
            options={visibilityList}
            getOptionLabel={option => option.name}
            getOptionSelected={(option, value) => option?.id === value.id}
            autoHighlight={false}
            disableClearable
            onChange={handleVisibilityChange}
            value={selectedVisibility || null}
            popupIcon={
              <SvgIcon
                classes={{ root: styles.fill }}
                component={ChevronDownIcon}
                viewBox={'0 0 20 20'}
              />
            }
            renderInput={({ inputProps, ...rest }) => (
              <TextField
                {...rest}
                error={errors.visibility}
                label={i18n.t('Experience.Editor.Label_4')}
                placeholder={i18n.t('Experience.Editor.Placeholder_4')}
                variant="outlined"
                inputProps={{ ...inputProps, readOnly: true }}
              />
            )}
          />

          {selectedVisibility?.id === 'selected_user' && (
            <>
              <Autocomplete
                id="experience-custom-visibility-people"
                onBlur={clearUsers}
                className={styles.people}
                value={(selectedUserIds as User[]) ?? []}
                multiple
                options={users}
                getOptionSelected={(option, value) => option.id === value.id}
                filterSelectedOptions={true}
                getOptionLabel={option => `${option.username} ${option.name}`}
                disableClearable
                autoHighlight={false}
                popupIcon={
                  <SvgIcon
                    classes={{ root: styles.fill }}
                    component={SearchIcon}
                    viewBox={'0 0 20 20'}
                  />
                }
                onChange={handleVisibilityPeopleChange}
                renderTags={() => null}
                renderInput={params => (
                  <TextField
                    {...params}
                    error={errors.selectedUserId}
                    label={i18n.t('Experience.Editor.Placeholder_5')}
                    placeholder={i18n.t('Experience.Editor.Placeholder_5')}
                    variant="outlined"
                    onChange={handleSearchUser}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                    helperText={i18n.t('Experience.Editor.Helper.People')}
                  />
                )}
                renderOption={(
                  option,
                  state: AutocompleteRenderOptionState,
                ) => {
                  if (option.id === '') return null;
                  return (
                    <div className={styles.option}>
                      <ListItemPeopleComponent
                        id="selectable-experience-list-item"
                        title={option.name}
                        subtitle={
                          <Typography variant="caption">
                            @{option.username}
                          </Typography>
                        }
                        avatar={option.profilePictureURL}
                        platform={'myriad'}
                        action={
                          <IconButton className={styles.removePeople}>
                            {state.selected ? (
                              <SvgIcon
                                classes={{ root: styles.fill }}
                                component={XCircleIcon}
                                color="error"
                                viewBox={'0 0 20 20'}
                              />
                            ) : (
                              <SvgIcon
                                classes={{ root: styles.fill }}
                                component={PlusCircleIcon}
                                viewBox={'0 0 20 20'}
                              />
                            )}
                          </IconButton>
                        }
                      />
                    </div>
                  );
                }}
              />

              <div className={styles.preview}>
                <div className={styles.customVisibility}>
                  <ShowIf condition={isLoadingSelectedUser}>
                    <Loading />
                  </ShowIf>
                  {selectedUserIds
                    .filter(people => !isEmpty(people.id))
                    .map(people => (
                      <ListItemPeopleComponent
                        id="selected-experience-list-item"
                        key={people.id}
                        title={people.name}
                        subtitle={
                          <Typography variant="caption">
                            @{people.username}
                          </Typography>
                        }
                        avatar={people.profilePictureURL}
                        platform={'myriad'}
                        action={
                          <IconButton onClick={removeVisibilityPeople(people)}>
                            <SvgIcon
                              classes={{ root: styles.fill }}
                              component={XCircleIcon}
                              color="error"
                              viewBox={'0 0 20 20'}
                            />
                          </IconButton>
                        }
                      />
                    ))}
                </div>
              </div>
            </>
          )}

          <FormControl
            fullWidth
            variant="outlined"
            style={{ position: 'relative' }}>
            <InputLabel htmlFor="experience-description">
              {i18n.t('Experience.Editor.Subtitle_2')}
            </InputLabel>
            <OutlinedInput
              id="experience-description"
              placeholder={i18n.t('Experience.Editor.Subtitle_2')}
              value={newExperience?.description || ''}
              onChange={handleChange('description')}
              labelWidth={70}
              inputProps={{ maxLength: 280 }}
              multiline
            />
            <FormHelperText id="experience-description-error">
              &nbsp;
            </FormHelperText>
            <Typography variant="subtitle1" className={styles.counter}>
              {newExperience?.description?.length ?? 0}/280
            </Typography>
          </FormControl>

          <Autocomplete<string, true, true, true>
            className={styles.fill}
            id="experience-tags-include"
            freeSolo
            multiple
            value={newExperience.allowedTags ?? []}
            options={tags
              .map(tag => tag.id)
              .filter(tag => !newExperience.allowedTags.includes(tag))}
            disableClearable
            onChange={(event, value, reason) => {
              handleTagsChange(event, value, reason, TagsProps.ALLOWED);
            }}
            onInputChange={(event, value) => {
              handleTagsInputChange(event, value, TagsProps.ALLOWED);
            }}
            getOptionLabel={option => `#${option}`}
            renderInput={params => (
              <TextField
                {...params}
                error={errors.tags}
                label={i18n.t('Experience.Editor.Label_1')}
                variant="outlined"
                placeholder={
                  newExperience.allowedTags.length === 0
                    ? i18n.t('Experience.Editor.Placeholder_1')
                    : undefined
                }
                onChange={handleSearchTags}
                helperText={''}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />

          <Autocomplete
            className={styles.fill}
            id="experience-tags-exclude"
            freeSolo
            multiple
            value={newExperience?.prohibitedTags ?? []}
            options={tags
              .map(tag => tag.id)
              .filter(tag => !newExperience.prohibitedTags?.includes(tag))}
            disableClearable
            onChange={(event, value, reason) => {
              handleTagsChange(event, value, reason, TagsProps.PROHIBITED);
            }}
            onInputChange={(event, value) => {
              handleTagsInputChange(event, value, TagsProps.PROHIBITED);
            }}
            getOptionLabel={option => `#${option}`}
            renderInput={params => (
              <TextField
                {...params}
                label={i18n.t('Experience.Editor.Label_2')}
                variant="outlined"
                placeholder={
                  newExperience.prohibitedTags?.length === 0
                    ? i18n.t('Experience.Editor.Placeholder_2')
                    : undefined
                }
                onChange={handleSearchTags}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />

          <Autocomplete
            id="experience-people"
            className={styles.people}
            value={(newExperience?.people as People[]) ?? []}
            multiple
            options={people}
            getOptionSelected={(option, value) => option.id === value.id}
            filterSelectedOptions={true}
            getOptionLabel={option => `${option.username} ${option.name}`}
            disableClearable
            autoHighlight={false}
            popupIcon={
              <SvgIcon
                classes={{ root: styles.fill }}
                component={SearchIcon}
                viewBox={'0 0 20 20'}
              />
            }
            onChange={handlePeopleChange}
            renderTags={() => null}
            renderInput={params => (
              <TextField
                {...params}
                error={errors.people}
                label={i18n.t('Experience.Editor.Label_3')}
                placeholder={i18n.t('Experience.Editor.Placeholder_3')}
                variant="outlined"
                onChange={handleSearchPeople}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
                helperText={''}
              />
            )}
            renderOption={(option, state: AutocompleteRenderOptionState) => {
              if (option.id === '') return null;
              return (
                <div className={styles.option}>
                  <ListItemPeopleComponent
                    id="selectable-experience-list-item"
                    title={option.name}
                    subtitle={
                      <Typography variant="caption">
                        @{option.username}
                      </Typography>
                    }
                    avatar={option.profilePictureURL}
                    platform={option.platform}
                    action={
                      <IconButton className={styles.removePeople}>
                        {state.selected ? (
                          <SvgIcon
                            classes={{ root: styles.fill }}
                            component={XCircleIcon}
                            color="error"
                            viewBox={'0 0 20 20'}
                          />
                        ) : (
                          <SvgIcon
                            classes={{ root: styles.fill }}
                            component={PlusCircleIcon}
                            viewBox={'0 0 20 20'}
                          />
                        )}
                      </IconButton>
                    }
                  />
                </div>
              );
            }}
          />

          <div className={styles.preview}>
            {newExperience.people
              .filter(people => !isEmpty(people.id))
              .map(people => (
                <ListItemPeopleComponent
                  id="selected-experience-list-item"
                  key={people.id}
                  title={people.name}
                  subtitle={
                    <Typography variant="caption">
                      @{people.username}
                    </Typography>
                  }
                  avatar={people.profilePictureURL}
                  platform={people.platform}
                  action={
                    <IconButton onClick={removeSelectedPeople(people)}>
                      <SvgIcon
                        classes={{ root: styles.fill }}
                        component={XCircleIcon}
                        color="error"
                        viewBox={'0 0 20 20'}
                      />
                    </IconButton>
                  }
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
