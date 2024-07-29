import { useEffect, useState } from 'react';

import {
  ExperienceOwner,
  useExperienceHook,
} from 'src/hooks/use-experience-hook';
import { WrappedExperience } from 'src/interfaces/experience';

export const useExperienceList = (owner: ExperienceOwner) => {
  const {
    experiences,
    userExperiences,
    profileExperiences,
    trendingExperiences,
    discover,
  } = useExperienceHook();

  const [list, setList] = useState<WrappedExperience[]>([]);

  useEffect(() => {
    generateExperienceList();
  }, [
    experiences,
    userExperiences,
    profileExperiences,
    trendingExperiences,
    discover,
  ]);

  const generateExperienceList = () => {
    const subscribedExperiencesIds = userExperiences.map(
      item => item.experience.id,
    );

    switch (owner) {
      case ExperienceOwner.CURRENT_USER:
        setList(userExperiences);
        break;
      case ExperienceOwner.PROFILE:
        setList(
          profileExperiences.map(profileExperience => {
            const subscribed = subscribedExperiencesIds.includes(
              profileExperience.experience.id,
            );
            const subscribedExperience = userExperiences.find(
              userExperience =>
                userExperience.experience.id ===
                profileExperience.experience.id,
            );

            return {
              ...profileExperience,
              id: subscribedExperience
                ? subscribedExperience.id
                : profileExperience.id,
              subscribed,
            };
          }),
        );

        break;
      case ExperienceOwner.TRENDING:
        setList(
          trendingExperiences.map(experience => ({
            id:
              userExperiences.find(item => item.experience.id === experience.id)
                ?.id ?? undefined,
            subscribed: subscribedExperiencesIds.includes(experience.id),
            experience,
          })),
        );
        break;

      case ExperienceOwner.DISCOVER:
        setList(
          discover.map(experience => ({
            id:
              userExperiences.find(item => item.experience.id === experience.id)
                ?.id ?? undefined,
            subscribed: subscribedExperiencesIds.includes(experience.id),
            experience,
          })),
        );
        break;

      default:
        setList(
          experiences.map(experience => ({
            id:
              userExperiences.find(item => item.experience.id === experience.id)
                ?.id ?? undefined,
            subscribed: subscribedExperiencesIds.includes(experience.id),
            experience,
          })),
        );
        break;
    }
  };

  return {
    list,
    limitExceeded: userExperiences.length >= 10,
  };
};
