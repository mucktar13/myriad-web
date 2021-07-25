import React, {useEffect} from 'react';

import dynamic from 'next/dynamic';

import {useTheme} from '@material-ui/core/styles';

import AppBar from '../app-bar/app-bar.component';
import {TabPanel} from '../common/tab-panel.component';

import {NotifProvider} from 'src/context/notif.context';
import {useLayout} from 'src/hooks/use-layout.hook';
import {SidebarTab} from 'src/interfaces/sidebar';

const FriendComponent = dynamic(() => import('../friends/friend.component'));
const NotificationComponent = dynamic(() => import('../notifications/notif.component'));
const TimelineComponent = dynamic(() => import('../timeline/timeline.component'));
const TopicComponent = dynamic(() => import('../topic/topic.component'));
const WalletComponent = dynamic(() => import('../topic/topic.component'));

type MobileLayoutProps = {
  children: React.ReactNode;
  anonymous: boolean;
};

const MobileLayoutComponent: React.FC<MobileLayoutProps> = ({anonymous}) => {
  const theme = useTheme();

  const {selectedSidebar, changeSelectedSidebar} = useLayout();

  useEffect(() => {
    if (anonymous) {
      changeSelectedSidebar(SidebarTab.HOME);
    } else {
      changeSelectedSidebar(SidebarTab.WALLET);
    }
  }, []);

  return (
    <>
      <NotifProvider>
        <AppBar />
        <TabPanel value={selectedSidebar} index={SidebarTab.HOME} dir={theme.direction}>
          <TimelineComponent isAnonymous={anonymous} />
        </TabPanel>
        <TabPanel value={selectedSidebar} index={SidebarTab.WALLET} dir={theme.direction}>
          <WalletComponent />
        </TabPanel>
        <TabPanel value={selectedSidebar} index={SidebarTab.TRENDING} dir={theme.direction}>
          <TopicComponent />
        </TabPanel>
        <TabPanel value={selectedSidebar} index={SidebarTab.FRIENDS} dir={theme.direction}>
          <FriendComponent />
        </TabPanel>
        <TabPanel value={selectedSidebar} index={SidebarTab.NOTIFICATION} dir={theme.direction}>
          <NotificationComponent />
        </TabPanel>
      </NotifProvider>
    </>
  );
};

export default MobileLayoutComponent;
