import React, { useEffect } from 'react';

import { useRouter } from 'next/router';

import { ExperiencePreview } from './ExperiencePreview';
import { useStyles } from './experience.style';

import { TopNavbarComponent } from 'src/components/atoms/TopNavbar';
import { useExperienceHook } from 'src/hooks/use-experience-hook';
import i18n from 'src/locale';

export const ExperiencePreviewContainer: React.FC = () => {
  const {
    experience,
    userExperiences,
    getExperienceDetail,
    subscribeExperience,
    unsubscribeExperience,
  } = useExperienceHook();

  const style = useStyles();
  const router = useRouter();
  const { experienceId } = router.query;

  useEffect(() => {
    if (experienceId) getExperienceDetail(experienceId);
  }, [experienceId]);

  const handleSubscribeExperience = (experienceId: string) => {
    subscribeExperience(experienceId);
  };

  const handleUnsubscribeExperience = (userExperienceId: string) => {
    unsubscribeExperience(userExperienceId);
  };

  const handleCloneExperience = (experienceId: string) => {
    router.push(`/experience/${experienceId}/clone`);
  };

  const handleEditExperience = (experienceId: string) => {
    router.push(`/experience/${experienceId}/edit`);
  };

  if (!experience) return null;

  return (
    <>
      <TopNavbarComponent
        description={i18n.t('TopNavbar.Title.Experience')}
        sectionTitle={experience.name || 'Experience'}
      />
      <div className={style.box}>
        <ExperiencePreview
          experience={experience}
          userExperiences={userExperiences}
          userId={experience.id}
          onSubscribe={handleSubscribeExperience}
          onUnsubscribe={handleUnsubscribeExperience}
          onFollow={handleCloneExperience}
          onUpdate={handleEditExperience}
        />
      </div>
    </>
  );
};
