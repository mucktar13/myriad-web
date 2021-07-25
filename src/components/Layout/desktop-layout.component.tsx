import React from 'react';

import AppBar from '../app-bar/app-bar.component';
import ShowIf from '../common/show-if.component';
import SidebarComponent from '../sidebar/sidebar.component';
import {useStyles} from './layout.style';

import BannerDemo from 'src/components/common/banner-demo.component';
import {NotifProvider} from 'src/context/notif.context';
import {useLayout} from 'src/hooks/use-layout.hook';

type DesktopLayoutProps = {
  children: React.ReactNode;
  anonymous: boolean;
  search?: string;
};

const DesktopLayoutComponent: React.FC<DesktopLayoutProps> = ({children, search, anonymous}) => {
  const style = useStyles();
  const {setting} = useLayout();

  return (
    <>
      <NotifProvider>
        <AppBar search={search} />
        <BannerDemo />

        <div className={style.appWrapper}>
          <div className={style.contentWrapper}>{children}</div>

          <div className={style.experience}>
            <ShowIf condition={!setting.focus}>
              <SidebarComponent isAnonymous={anonymous} />
            </ShowIf>
          </div>
        </div>
      </NotifProvider>
    </>
  );
};

export default DesktopLayoutComponent;
