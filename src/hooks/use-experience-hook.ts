import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import {
  WrappedExperience,
  ExperienceProps,
  Experience,
} from '../interfaces/experience';
import { RootState } from '../reducers';

import { useEnqueueSnackbar } from 'components/common/Snackbar/useEnqueueSnackbar.hook';
import pick from 'lodash/pick';
import { ListMeta } from 'src/lib/api/interfaces/base-list.interface';
import {
  searchExperiences,
  searchPeople,
  searchTags,
  cloneExperience,
  loadExperiences,
  loadExperiencesAdded,
  loadExperiencesPostList,
  fetchPostsExperience,
  addPostsExperience,
  createExperience,
  fetchDetailExperience,
  subscribeExperience,
  updateExperience,
  deleteExperience,
  unsubscribeExperience,
  clearExperiences,
  fetchTrendingExperience,
  searchAdvancesExperiences,
  clearAdvancesExperiences,
  clearTrendingExperiences,
} from 'src/reducers/experience/actions';
import { ExperienceState } from 'src/reducers/experience/reducer';
import {
  clearUserExperiences,
  fetchUserExperience,
} from 'src/reducers/user/actions';

export enum ExperienceOwner {
  ALL = 'all',
  CURRENT_USER = 'current_user',
  PROFILE = 'profile',
  TRENDING = 'trending',
  DISCOVER = 'DISCOVER',
  PERSONAL = 'personal',
}

//TODO: isn't it better to rename this to something more general like, useSearchHook?
// it's not obvious if we want to searchPeople we can use this hook
export const useExperienceHook = () => {
  const dispatch = useDispatch();
  const enqueueSnackbar = useEnqueueSnackbar();

  const {
    experiences,
    experiencePosts,
    trendingExperiences,
    selectedExperience,
    searchTags: tags,
    searchPeople: people,
    detail: experience,
    hasMore,
    meta,
    loading,
    discover,
  } = useSelector<RootState, ExperienceState>(state => state.experienceState);
  const profileExperiences = useSelector<RootState, WrappedExperience[]>(
    state => state.profileState.experience.data,
    shallowEqual,
  );
  const { data: userExperiences, meta: userExperiencesMeta } = useSelector<
    RootState,
    { data: WrappedExperience[]; meta: ListMeta }
  >(state => state.userState.experiences, shallowEqual);

  const loadExperience = () => {
    dispatch(loadExperiences());
  };

  const loadExperienceAdded = (
    postId: string,
    callback: (postsExperiences: Experience[]) => void,
  ) => {
    dispatch(loadExperiencesAdded(postId, callback));
  };

  const loadExperiencePostList = (
    postId: string,
    callback: (postsExperiences: Experience[]) => void,
  ) => {
    dispatch(loadExperiencesPostList(postId, callback));
  };

  const addPostsToExperience = (
    postId: string,
    listExperiences: string[],
    callback: () => void,
  ) => {
    dispatch(addPostsExperience(postId, listExperiences, callback));
  };

  const loadPostExperience = (experienceId: string) => {
    dispatch(fetchPostsExperience(experienceId));
  };

  const loadNextPostExperience = (experienceId: string) => {
    const page = meta.currentPage + 1;
    dispatch(fetchPostsExperience(experienceId, page));
  };

  const loadTrendingExperience = (page = 1, createdBy?: string) => {
    dispatch(fetchTrendingExperience(page, createdBy));
  };

  const nextPage = async () => {
    const page = meta.currentPage + 1;

    dispatch(loadExperiences(page));
  };

  const getExperienceDetail = (experienceId: string | string[]) => {
    const id = experienceId as string;
    dispatch(fetchDetailExperience(id));
  };

  const findExperience = async (query: string, page = 1) => {
    dispatch(searchExperiences(query, page));
  };

  const findPeople = (query: string) => {
    dispatch(searchPeople(query));
  };

  const findTags = (query: string) => {
    dispatch(searchTags(query));
  };

  const followExperience = (
    experienceId: string,
    newExperience: ExperienceProps,
    callback?: (id: string) => void,
  ) => {
    const attributes = pick(newExperience, [
      'name',
      'description',
      'allowedTags',
      'experienceImageURL',
      'prohibitedTags',
      'people',
      'visibility',
      'selectedUserIds',
    ]);

    dispatch(
      cloneExperience(experienceId, attributes, id => {
        callback && callback(id);

        enqueueSnackbar({
          variant: 'success',
          message: 'Timeline successfully cloned!',
        });
      }),
    );
  };

  const editExperience = (
    experienceId: string,
    newExperience: ExperienceProps,
    callback?: (id: string) => void,
  ) => {
    const attributes = pick(newExperience, [
      'name',
      'description',
      'allowedTags',
      'experienceImageURL',
      'prohibitedTags',
      'people',
      'visibility',
      'selectedUserIds',
    ]);

    dispatch(
      updateExperience(experienceId, attributes, id => {
        callback && callback(id);

        enqueueSnackbar({
          variant: 'success',
          message: 'Timeline successfully updated!',
        });
      }),
    );
  };

  const saveExperience = (
    newExperience: ExperienceProps,
    callback?: (id: string) => void,
  ) => {
    dispatch(
      createExperience(newExperience, id => {
        callback && callback(id);

        enqueueSnackbar({
          variant: 'success',
          message: 'Timeline successfully created!',
        });
      }),
    );
  };

  const beSubscribeExperience = (
    experienceId: string,
    callback?: () => void,
  ) => {
    dispatch(
      subscribeExperience(experienceId, () => {
        dispatch(fetchUserExperience());
        callback && callback();

        enqueueSnackbar({
          variant: 'success',
          message: 'Followed successfully!',
        });
      }),
    );
  };

  const removeExperience = (experienceId: string, callback?: () => void) => {
    dispatch(
      deleteExperience(experienceId, () => {
        dispatch(fetchUserExperience());

        callback && callback();
      }),
    );
  };

  const beUnsubscribeExperience = (
    experienceId: string,
    callback?: () => void,
  ) => {
    dispatch(
      unsubscribeExperience(experienceId, () => {
        dispatch(fetchUserExperience());
        callback && callback();

        enqueueSnackbar({
          variant: 'success',
          message: 'Unfollowed successfully!',
        });
      }),
    );
  };

  const loadNextUserExperience = (type?: string) => {
    const page = userExperiencesMeta.currentPage + 1;
    dispatch(fetchUserExperience(page, type));
  };

  const clear = () => {
    dispatch(clearExperiences());
  };

  const clearUserExperience = () => {
    dispatch(clearUserExperiences());
  };

  const clearAdvancesExperience = () => {
    dispatch(clearAdvancesExperiences());
  };

  const clearTrendingExperience = () => {
    dispatch(clearTrendingExperiences());
  };

  const advanceSearchExperience = async (
    params,
    page = 1,
    nextPage: boolean,
  ) => {
    const newPage = nextPage ? meta.currentPage + 1 : page;
    dispatch(searchAdvancesExperiences(params, newPage));
  };

  return {
    loading,
    page: meta.currentPage,
    hasMore,
    experiences,
    experiencePosts,
    trendingExperiences,
    userExperiences,
    userExperiencesMeta,
    profileExperiences,
    experience,
    selectedExperience,
    tags,
    people,
    discover,
    loadExperience,
    loadExperienceAdded,
    loadExperiencePostList,
    addPostsToExperience,
    loadPostExperience,
    loadNextPostExperience,
    loadNextUserExperience,
    nextPage,
    searchExperience: findExperience,
    searchPeople: findPeople,
    searchTags: findTags,
    cloneExperience: followExperience,
    saveExperience,
    getExperienceDetail,
    subscribeExperience: beSubscribeExperience,
    updateExperience: editExperience,
    removeExperience,
    unsubscribeExperience: beUnsubscribeExperience,
    clearExperiences: clear,
    loadTrendingExperience,
    clearUserExperience,
    advanceSearchExperience,
    clearAdvancesExperience,
    clearTrendingExperience,
  };
};
