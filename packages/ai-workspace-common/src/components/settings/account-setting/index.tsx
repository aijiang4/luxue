import { Button, Form, Input, Upload, Modal, message } from 'antd';
import { useEffect, useState } from 'react';
import getClient from '@refly-packages/ai-workspace-common/requests/proxiedRequest';
import { AiOutlineUser } from 'react-icons/ai';

import { useUserStore } from '@refly-packages/ai-workspace-common/stores/user';
// components
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';

export const AccountSetting = () => {
  const [form] = Form.useForm();
  const userStore = useUserStore();
  const { t } = useTranslation();

  const [nameStatus, setNameStatus] = useState<'error' | 'success' | 'warning' | 'validating'>(
    'success',
  );
  const [nameMessage, setNameMessage] = useState('');
  const [emailStatus, setEmailStatus] = useState<'error' | 'success' | 'warning' | 'validating'>(
    'success',
  );
  const [_emailMessage, setEmailMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const statusMap = {
    name: { status: nameStatus, setStatus: setNameStatus, setMessage: setNameMessage },
    email: { status: emailStatus, setStatus: setEmailStatus, setMessage: setEmailMessage },
  };

  const checkUsername = async (name: string) => {
    try {
      const { data } = await getClient().checkSettingsField({
        query: { field: 'name', value: name },
      });
      return data?.data?.available;
    } catch (_error) {
      return false;
    }
  };

  const validateField = async (value: string, field: 'name' | 'email') => {
    const { setStatus, setMessage } = statusMap[field];
    if (!value) {
      setStatus('error');
      setMessage(t(`settings.account.${field}Placeholder`));
      return;
    }
    if (!/^[a-zA-Z0-9_]{1,30}$/.test(value)) {
      setStatus('error');
      setMessage(t(`settings.account.${field}ValidationError`));
      return;
    }
    setMessage(t(''));

    const isAvailable = await checkUsername(value);
    if (!isAvailable) {
      setStatus('error');
      setMessage(t(`settings.account.${field}Invalid`));
    } else {
      setStatus('success');
      setMessage('');
    }
  };

  const debouncedValidateField = useDebouncedCallback(validateField, 300);

  const handleUpdate = () => {
    if (nameStatus === 'error') {
      return;
    }
    form.validateFields().then(async (values) => {
      const { name, nickname } = values;
      if (loading) return;
      setLoading(true);
      const { error } = await getClient().updateSettings({
        body: {
          name,
          nickname,
        },
      });
      if (error) {
        console.log(error);
        return;
      }
      setLoading(false);
      message.success(t('settings.account.updateSuccess'));
      userStore.setUserProfile({ ...userStore.userProfile, name, nickname });
    });
  };

  useEffect(() => {
    form.setFieldsValue({
      ...userStore.userProfile,
      avatar: [
        {
          uid: '-1',
          url: userStore.userProfile?.avatar,
          name: userStore.userProfile?.avatar,
        },
      ],
    });
  }, [userStore.userProfile]);

  return (
    <div className="w-full">
      <div className="max-w-[600px] mx-auto">
        <Form form={form} layout="vertical">
          <Form.Item
            label={t('settings.account.avatar')}
            name="avatar"
            valuePropName="fileList"
            initialValue={[]}
          >
            <Upload
              listType="picture-circle"
              disabled
              name="files"
              action="/"
              maxCount={1}
              onPreview={(file) => {
                Modal.info({
                  title: t('settings.account.avatar'),
                  okButtonProps: { style: { backgroundColor: '#00968F' } },
                  icon: <AiOutlineUser size={22} className="mr-1" />,
                  content: (
                    <div className="text-center">
                      <img
                        src={file?.url ?? URL.createObjectURL(file?.originFileObj)}
                        className="max-w-full"
                        alt="avatar"
                      />
                    </div>
                  ),
                });
              }}
            />
          </Form.Item>

          <Form.Item
            label={t('settings.account.name')}
            name="name"
            required
            validateStatus={nameStatus}
            help={nameMessage}
            rules={[{ required: true, message: t('settings.account.namePlaceholder') }]}
          >
            <Input
              maxLength={30}
              showCount
              prefix="@"
              placeholder={t('settings.account.namePlaceholder')}
              onChange={(e) => {
                debouncedValidateField(e.target.value, 'name');
              }}
            />
          </Form.Item>

          <Form.Item
            label={t('settings.account.nickname')}
            name="nickname"
            required
            rules={[{ required: true, message: t('settings.account.nicknamePlaceholder') }]}
          >
            <Input
              maxLength={30}
              showCount
              placeholder={t('settings.account.nicknamePlaceholder')}
            />
          </Form.Item>

          <Form.Item
            label={t('settings.account.email')}
            name="email"
            required
            rules={[{ required: true, message: t('settings.account.nicknamePlaceholder') }]}
          >
            <Input disabled placeholder={t('settings.account.emailPlaceholder')} />
          </Form.Item>

          <div className="flex justify-end mt-6">
            <Button type="primary" onClick={handleUpdate} loading={loading}>
              {t('settings.account.update')}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};
