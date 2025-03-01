import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

// components
import { useTranslation } from 'react-i18next';
import { SkillInstanceList } from '@refly-packages/ai-workspace-common/components/skill/skill-intance-list';

import { useNavigate, useSearchParams } from '@refly-packages/ai-workspace-common/utils/router';
import './index.scss';

import { Radio } from '@arco-design/web-react';

const RadioGroup = Radio.Group;

const ContentHeader = (props: {
  val: string;
  setVal: (val: string) => void;
}) => {
  const { setVal, val } = props;
  const { t } = useTranslation();
  return (
    <div className="skill-list__header flex items-center">
      <RadioGroup
        type="button"
        size="large"
        className="skill-list__tabs"
        defaultValue={val}
        value={val}
        onChange={(val) => setVal(val)}
      >
        <Radio value="instance" style={{ whiteSpace: 'nowrap' }}>
          {t('skill.tab.skillInstances')}
        </Radio>
        <Radio value="template" style={{ whiteSpace: 'nowrap' }}>
          {t('skill.tab.skillTemplate')}
        </Radio>
      </RadioGroup>
    </div>
  );
};

const Skill = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get('tab') as string;
  const [val, setVal] = useState(['template', 'instance'].includes(tab) ? tab : 'instance');

  useEffect(() => {
    if (['template', 'instance'].includes(tab)) {
      setVal(tab);
    }
  }, [tab]);

  return (
    <div className="skill-list">
      <Helmet>
        <title>
          {t('productName')} | {t('tabMeta.skill.title')}
        </title>
      </Helmet>
      <ContentHeader
        setVal={(val) => {
          searchParams.set('tab', val);
          navigate(`/skill?${searchParams.toString()}`);
          setVal(val);
        }}
        val={val}
      />
      <div className="skill-list__content">
        {val === 'instance' ? <SkillInstanceList canGoDetail={true} source="instance" /> : null}
      </div>
    </div>
  );
};

export default Skill;
