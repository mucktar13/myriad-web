import {useSelector} from 'react-redux';

import {useToasterHook} from './use-toaster.hook';

import {Comment} from 'src/interfaces/comment';
import {ReferenceType} from 'src/interfaces/interaction';
import {Post} from 'src/interfaces/post';
import {ReportProps} from 'src/interfaces/report';
import {Status} from 'src/interfaces/toaster';
import * as InteractionAPI from 'src/lib/api/interaction';
import {RootState} from 'src/reducers';
import {UserState} from 'src/reducers/user/reducer';

export const useReport = () => {
  const {user} = useSelector<RootState, UserState>(state => state.userState);

  const {openToaster} = useToasterHook();

  const sendReport = async (reference: Post | Comment, type: string, description: string) => {
    if (user) {
      const attributes = {
        referenceId: reference.id,
        referenceType: 'platform' in reference ? ReferenceType.POST : ReferenceType.COMMENT,
        type,
        description,
      };

      await InteractionAPI.report(user.id, attributes);
    }
  };

  const sendReportWithAttributes = async (value: ReportProps) => {
    if (user) {
      await InteractionAPI.report(user.id, value);

      openToaster({
        message: 'User has been reported',
        toasterStatus: Status.SUCCESS,
      });
    }
  };

  return {
    sendReport,
    sendReportWithAttributes,
  };
};
