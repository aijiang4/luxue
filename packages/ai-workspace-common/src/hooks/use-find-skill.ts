import { useMemo } from 'react';
import { useListSkills } from '@refly-packages/ai-workspace-common/queries';

export const useFindSkill = (skillName: string) => {
  const { data: skillData } = useListSkills({}, null, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 60 * 1000, // Data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  const skill = useMemo(
    () => skillData?.data?.find((skill) => skill.name === skillName),
    [skillData?.data, skillName],
  );
  return skill;
};
