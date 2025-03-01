import { useState } from 'react';

// components
import { useTranslation } from 'react-i18next';

import { Form, Input, Select, DatePicker } from '@arco-design/web-react';
import { FormHeader } from '@refly-packages/ai-workspace-common/components/skill/form-header';

const FormItem = Form.Item;
const Option = Select.Option;

const triggerType = ['timer', 'simpleEvent'];
const repeatInterval = ['hour', 'day', 'week', 'month', 'year'];

export const TriggerConfigFormItems = (props: {
  _triggerType: 'timer' | 'simpleEvent';
  setTriggerType: (triggerType: 'timer' | 'simpleEvent') => void;
  headerTitle: string;
}) => {
  const { _triggerType, setTriggerType, headerTitle } = props;
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <FormHeader
        title={headerTitle}
        enableCollapse
        collapsed={collapsed}
        onCollapseChange={setCollapsed}
      />
      {!collapsed && (
        <>
          <FormItem
            layout="vertical"
            label={t('skill.newTriggerModal.name')}
            required
            field="displayName"
            rules={[{ required: true, message: t('skill.newTriggerModal.namePlaceholder') }]}
          >
            <Input
              placeholder={t('skill.newTriggerModal.namePlaceholder')}
              maxLength={50}
              showWordLimit
            />
          </FormItem>

          <FormItem
            layout="vertical"
            label={t('skill.newTriggerModal.triggerType')}
            required
            field="triggerType"
            rules={[{ required: true, message: t('skill.newTriggerModal.triggerTypePlaceholder') }]}
          >
            <Select
              size="large"
              placeholder={t('skill.newTriggerModal.triggerTypePlaceholder')}
              onChange={(value) => {
                setTriggerType(value);
              }}
            >
              {triggerType.map((item) => {
                return (
                  <Option key={item} value={item}>
                    {t(`skill.newTriggerModal.${item}`)}
                  </Option>
                );
              })}
            </Select>
          </FormItem>

          {_triggerType === 'timer' && (
            <>
              <FormItem
                layout="vertical"
                label={t('skill.newTriggerModal.timerConfig')}
                required
                field="timerConfig.datetime"
                rules={[
                  { required: true, message: t('skill.newTriggerModal.timerConfigPlaceholder') },
                ]}
              >
                <DatePicker
                  showTime={{
                    defaultValue: '00:00:00',
                  }}
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder={t('skill.newTriggerModal.timerConfigPlaceholder')}
                />
              </FormItem>

              <FormItem
                layout="vertical"
                label={t('skill.newTriggerModal.repeatInterval')}
                field="timerConfig.repeatInterval"
              >
                <Select
                  allowClear
                  size="large"
                  placeholder={t('skill.newTriggerModal.repeatIntervalPlaceholder')}
                >
                  {repeatInterval.map((item) => {
                    return (
                      <Option key={item} value={item}>
                        {t(`skill.newTriggerModal.${item}`)}
                      </Option>
                    );
                  })}
                </Select>
              </FormItem>
            </>
          )}

          {_triggerType === 'simpleEvent' && (
            <FormItem
              layout="vertical"
              label={t('skill.newTriggerModal.event')}
              required
              field="simpleEventName"
              rules={[{ required: true, message: t('skill.newTriggerModal.eventPlaceholder') }]}
            >
              <Select size="large" placeholder={t('skill.newTriggerModal.eventPlaceholder')}>
                {['onResourceReady'].map((item) => {
                  return (
                    <Option key={item} value={item}>
                      {t(`skill.newTriggerModal.${item}`)}
                    </Option>
                  );
                })}
              </Select>
            </FormItem>
          )}
        </>
      )}
    </>
  );
};
