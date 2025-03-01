// generated with @7nohe/openapi-react-query-codegen@2.0.0-beta.3

import { type Options } from '@hey-api/client-fetch';
import { type QueryClient } from '@tanstack/react-query';
import {
  checkSettingsField,
  getActionResult,
  getAuthConfig,
  getCollabToken,
  getDocumentDetail,
  getResourceDetail,
  getSettings,
  getShareContent,
  getSubscriptionPlans,
  getSubscriptionUsage,
  listActions,
  listCanvases,
  listDocuments,
  listLabelClasses,
  listLabelInstances,
  listModels,
  listResources,
  listSkillInstances,
  listSkills,
  listSkillTriggers,
  serveStatic,
} from '../requests/services.gen';
import {
  CheckSettingsFieldData,
  GetActionResultData,
  GetDocumentDetailData,
  GetResourceDetailData,
  GetShareContentData,
  ListCanvasesData,
  ListDocumentsData,
  ListLabelClassesData,
  ListLabelInstancesData,
  ListResourcesData,
  ListSkillInstancesData,
  ListSkillTriggersData,
} from '../requests/types.gen';
import * as Common from './common';
export const ensureUseGetAuthConfigData = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseGetAuthConfigKeyFn(clientOptions),
    queryFn: () => getAuthConfig({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseGetCollabTokenData = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseGetCollabTokenKeyFn(clientOptions),
    queryFn: () => getCollabToken({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseListCanvasesData = (
  queryClient: QueryClient,
  clientOptions: Options<ListCanvasesData, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseListCanvasesKeyFn(clientOptions),
    queryFn: () => listCanvases({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseListResourcesData = (
  queryClient: QueryClient,
  clientOptions: Options<ListResourcesData, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseListResourcesKeyFn(clientOptions),
    queryFn: () => listResources({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseGetResourceDetailData = (
  queryClient: QueryClient,
  clientOptions: Options<GetResourceDetailData, true>,
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseGetResourceDetailKeyFn(clientOptions),
    queryFn: () => getResourceDetail({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseListDocumentsData = (
  queryClient: QueryClient,
  clientOptions: Options<ListDocumentsData, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseListDocumentsKeyFn(clientOptions),
    queryFn: () => listDocuments({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseGetDocumentDetailData = (
  queryClient: QueryClient,
  clientOptions: Options<GetDocumentDetailData, true>,
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseGetDocumentDetailKeyFn(clientOptions),
    queryFn: () => getDocumentDetail({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseGetShareContentData = (
  queryClient: QueryClient,
  clientOptions: Options<GetShareContentData, true>,
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseGetShareContentKeyFn(clientOptions),
    queryFn: () => getShareContent({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseListLabelClassesData = (
  queryClient: QueryClient,
  clientOptions: Options<ListLabelClassesData, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseListLabelClassesKeyFn(clientOptions),
    queryFn: () => listLabelClasses({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseListLabelInstancesData = (
  queryClient: QueryClient,
  clientOptions: Options<ListLabelInstancesData, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseListLabelInstancesKeyFn(clientOptions),
    queryFn: () => listLabelInstances({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseListActionsData = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseListActionsKeyFn(clientOptions),
    queryFn: () => listActions({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseGetActionResultData = (
  queryClient: QueryClient,
  clientOptions: Options<GetActionResultData, true>,
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseGetActionResultKeyFn(clientOptions),
    queryFn: () => getActionResult({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseListSkillsData = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseListSkillsKeyFn(clientOptions),
    queryFn: () => listSkills({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseListSkillInstancesData = (
  queryClient: QueryClient,
  clientOptions: Options<ListSkillInstancesData, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseListSkillInstancesKeyFn(clientOptions),
    queryFn: () => listSkillInstances({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseListSkillTriggersData = (
  queryClient: QueryClient,
  clientOptions: Options<ListSkillTriggersData, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseListSkillTriggersKeyFn(clientOptions),
    queryFn: () => listSkillTriggers({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseGetSettingsData = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseGetSettingsKeyFn(clientOptions),
    queryFn: () => getSettings({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseCheckSettingsFieldData = (
  queryClient: QueryClient,
  clientOptions: Options<CheckSettingsFieldData, true>,
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseCheckSettingsFieldKeyFn(clientOptions),
    queryFn: () => checkSettingsField({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseGetSubscriptionPlansData = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseGetSubscriptionPlansKeyFn(clientOptions),
    queryFn: () => getSubscriptionPlans({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseGetSubscriptionUsageData = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseGetSubscriptionUsageKeyFn(clientOptions),
    queryFn: () => getSubscriptionUsage({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseListModelsData = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseListModelsKeyFn(clientOptions),
    queryFn: () => listModels({ ...clientOptions }).then((response) => response.data),
  });
export const ensureUseServeStaticData = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.ensureQueryData({
    queryKey: Common.UseServeStaticKeyFn(clientOptions),
    queryFn: () => serveStatic({ ...clientOptions }).then((response) => response.data),
  });
