import { ChevronDownIcon } from '@heroicons/react/outline';

import React, { useState } from 'react';

import { Grid, Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SvgIcon from '@material-ui/core/SvgIcon';

import ShowIf from '../../common/show-if.component';
import { useStyles } from './DropdownMenu.styles';
import { MenuOptions } from './DropdownMenu.types';

import { SortIcon } from 'src/components/atoms/Icons';

type DropdownMenuProps<T> = {
  title: string;
  options: MenuOptions<T>[];
  selected?: T;
  disabled?: boolean;
  useIconOnMobile?: boolean;
  onChange: (selected: T) => void;
  marginBottom?: boolean;
  marginTop?: boolean;
  placeholder?: string;
  experience?: boolean;
};

export const DropdownMenu = <T,>(props: DropdownMenuProps<T>): JSX.Element => {
  const {
    title,
    options,
    onChange,
    disabled = false,
    useIconOnMobile = true,
    selected,
    marginBottom = true,
    marginTop = true,
    placeholder,
    experience = false,
  } = props;
  const styles = useStyles({
    useIconOnMobile,
    marginBottom,
    marginTop,
    experience,
  });

  const [current, setCurrent] = useState<T>(selected);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  React.useEffect(() => {
    setCurrent(selected);
  }, [selected]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelected = (option: T) => {
    setCurrent(option);
    onChange(option);
    handleClose();
  };

  const getSelectedText = (): string => {
    const match = options.find(option => option.id === current);
    if (match) {
      return match?.title;
    } else {
      if (placeholder) return placeholder;
      else return options[0].title;
    }
  };

  return (
    <div className={styles.root}>
      <Grid container justifyContent="space-between" className={styles.content}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            component="span"
            color={experience ? 'textPrimary' : 'textSecondary'}
            className={styles.title}>
            <ShowIf condition={title.length > 0}>{title}:&nbsp;</ShowIf>
          </Typography>

          <Typography
            component="span"
            color={
              disabled
                ? 'textSecondary'
                : experience
                ? 'primary'
                : 'textPrimary'
            }
            className={styles.selected}>
            {getSelectedText()}
          </Typography>
        </div>
        <IconButton
          onClick={handleClick}
          color="primary"
          aria-label="expand"
          className={styles.expand}
          disabled={disabled}>
          <SvgIcon
            component={ChevronDownIcon}
            fontSize="small"
            color={disabled ? 'inherit' : 'primary'}
          />
        </IconButton>
      </Grid>

      <IconButton
        onClick={handleClick}
        color="primary"
        aria-label="expand"
        className={styles.sort}>
        <SortIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={Boolean(anchorEl)}
        onClose={handleClose}>
        {options.map(option => (
          <MenuItem
            key={option.title}
            onClick={() => handleSelected(option.id)}>
            {option.title}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
