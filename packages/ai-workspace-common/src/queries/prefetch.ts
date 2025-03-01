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
export const prefetchUseGetAuthConfig = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseGetAuthConfigKeyFn(clientOptions),
    queryFn: () => getAuthConfig({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseGetCollabToken = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseGetCollabTokenKeyFn(clientOptions),
    queryFn: () => getCollabToken({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseListCanvases = (
  queryClient: QueryClient,
  clientOptions: Options<ListCanvasesData, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseListCanvasesKeyFn(clientOptions),
    queryFn: () => listCanvases({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseListResources = (
  queryClient: QueryClient,
  clientOptions: Options<ListResourcesData, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseListResourcesKeyFn(clientOptions),
    queryFn: () => listResources({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseGetResourceDetail = (
  queryClient: QueryClient,
  clientOptions: Options<GetResourceDetailData, true>,
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseGetResourceDetailKeyFn(clientOptions),
    queryFn: () => getResourceDetail({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseListDocuments = (
  queryClient: QueryClient,
  clientOptions: Options<ListDocumentsData, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseListDocumentsKeyFn(clientOptions),
    queryFn: () => listDocuments({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseGetDocumentDetail = (
  queryClient: QueryClient,
  clientOptions: Options<GetDocumentDetailData, true>,
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseGetDocumentDetailKeyFn(clientOptions),
    queryFn: () => getDocumentDetail({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseGetShareContent = (
  queryClient: QueryClient,
  clientOptions: Options<GetShareContentData, true>,
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseGetShareContentKeyFn(clientOptions),
    queryFn: () => getShareContent({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseListLabelClasses = (
  queryClient: QueryClient,
  clientOptions: Options<ListLabelClassesData, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseListLabelClassesKeyFn(clientOptions),
    queryFn: () => listLabelClasses({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseListLabelInstances = (
  queryClient: QueryClient,
  clientOptions: Options<ListLabelInstancesData, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseListLabelInstancesKeyFn(clientOptions),
    queryFn: () => listLabelInstances({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseListActions = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseListActionsKeyFn(clientOptions),
    queryFn: () => listActions({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseGetActionResult = (
  queryClient: QueryClient,
  clientOptions: Options<GetActionResultData, true>,
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseGetActionResultKeyFn(clientOptions),
    queryFn: () => getActionResult({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseListSkills = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseListSkillsKeyFn(clientOptions),
    queryFn: () => listSkills({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseListSkillInstances = (
  queryClient: QueryClient,
  clientOptions: Options<ListSkillInstancesData, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseListSkillInstancesKeyFn(clientOptions),
    queryFn: () => listSkillInstances({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseListSkillTriggers = (
  queryClient: QueryClient,
  clientOptions: Options<ListSkillTriggersData, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseListSkillTriggersKeyFn(clientOptions),
    queryFn: () => listSkillTriggers({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseGetSettings = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseGetSettingsKeyFn(clientOptions),
    queryFn: () => getSettings({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseCheckSettingsField = (
  queryClient: QueryClient,
  clientOptions: Options<CheckSettingsFieldData, true>,
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseCheckSettingsFieldKeyFn(clientOptions),
    queryFn: () => checkSettingsField({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseGetSubscriptionPlans = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseGetSubscriptionPlansKeyFn(clientOptions),
    queryFn: () => getSubscriptionPlans({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseGetSubscriptionUsage = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseGetSubscriptionUsageKeyFn(clientOptions),
    queryFn: () => getSubscriptionUsage({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseListModels = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseListModelsKeyFn(clientOptions),
    queryFn: () => listModels({ ...clientOptions }).then((response) => response.data),
  });
export const prefetchUseServeStatic = (
  queryClient: QueryClient,
  clientOptions: Options<unknown, true> = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseServeStaticKeyFn(clientOptions),
    queryFn: () => serveStatic({ ...clientOptions }).then((response) => response.data),
  });
