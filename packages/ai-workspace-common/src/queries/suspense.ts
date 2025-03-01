// generated with @7nohe/openapi-react-query-codegen@2.0.0-beta.3

import { type Options } from '@hey-api/client-fetch';
import { UseQueryOptions, useSuspenseQuery } from '@tanstack/react-query';
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
  CheckSettingsFieldError,
  GetActionResultData,
  GetActionResultError,
  GetAuthConfigError,
  GetCollabTokenError,
  GetDocumentDetailData,
  GetDocumentDetailError,
  GetResourceDetailData,
  GetResourceDetailError,
  GetSettingsError,
  GetShareContentData,
  GetShareContentError,
  GetSubscriptionPlansError,
  GetSubscriptionUsageError,
  ListActionsError,
  ListCanvasesData,
  ListCanvasesError,
  ListDocumentsData,
  ListDocumentsError,
  ListLabelClassesData,
  ListLabelClassesError,
  ListLabelInstancesData,
  ListLabelInstancesError,
  ListModelsError,
  ListResourcesData,
  ListResourcesError,
  ListSkillInstancesData,
  ListSkillInstancesError,
  ListSkillsError,
  ListSkillTriggersData,
  ListSkillTriggersError,
  ServeStaticError,
} from '../requests/types.gen';
import * as Common from './common';
export const useGetAuthConfigSuspense = <
  TData = Common.GetAuthConfigDefaultResponse,
  TError = GetAuthConfigError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<unknown, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseGetAuthConfigKeyFn(clientOptions, queryKey),
    queryFn: () =>
      getAuthConfig({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useGetCollabTokenSuspense = <
  TData = Common.GetCollabTokenDefaultResponse,
  TError = GetCollabTokenError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<unknown, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseGetCollabTokenKeyFn(clientOptions, queryKey),
    queryFn: () =>
      getCollabToken({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useListCanvasesSuspense = <
  TData = Common.ListCanvasesDefaultResponse,
  TError = ListCanvasesError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<ListCanvasesData, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseListCanvasesKeyFn(clientOptions, queryKey),
    queryFn: () =>
      listCanvases({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useListResourcesSuspense = <
  TData = Common.ListResourcesDefaultResponse,
  TError = ListResourcesError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<ListResourcesData, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseListResourcesKeyFn(clientOptions, queryKey),
    queryFn: () =>
      listResources({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useGetResourceDetailSuspense = <
  TData = Common.GetResourceDetailDefaultResponse,
  TError = GetResourceDetailError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<GetResourceDetailData, true>,
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseGetResourceDetailKeyFn(clientOptions, queryKey),
    queryFn: () =>
      getResourceDetail({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useListDocumentsSuspense = <
  TData = Common.ListDocumentsDefaultResponse,
  TError = ListDocumentsError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<ListDocumentsData, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseListDocumentsKeyFn(clientOptions, queryKey),
    queryFn: () =>
      listDocuments({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useGetDocumentDetailSuspense = <
  TData = Common.GetDocumentDetailDefaultResponse,
  TError = GetDocumentDetailError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<GetDocumentDetailData, true>,
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseGetDocumentDetailKeyFn(clientOptions, queryKey),
    queryFn: () =>
      getDocumentDetail({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useGetShareContentSuspense = <
  TData = Common.GetShareContentDefaultResponse,
  TError = GetShareContentError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<GetShareContentData, true>,
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseGetShareContentKeyFn(clientOptions, queryKey),
    queryFn: () =>
      getShareContent({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useListLabelClassesSuspense = <
  TData = Common.ListLabelClassesDefaultResponse,
  TError = ListLabelClassesError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<ListLabelClassesData, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseListLabelClassesKeyFn(clientOptions, queryKey),
    queryFn: () =>
      listLabelClasses({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useListLabelInstancesSuspense = <
  TData = Common.ListLabelInstancesDefaultResponse,
  TError = ListLabelInstancesError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<ListLabelInstancesData, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseListLabelInstancesKeyFn(clientOptions, queryKey),
    queryFn: () =>
      listLabelInstances({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useListActionsSuspense = <
  TData = Common.ListActionsDefaultResponse,
  TError = ListActionsError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<unknown, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseListActionsKeyFn(clientOptions, queryKey),
    queryFn: () =>
      listActions({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useGetActionResultSuspense = <
  TData = Common.GetActionResultDefaultResponse,
  TError = GetActionResultError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<GetActionResultData, true>,
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseGetActionResultKeyFn(clientOptions, queryKey),
    queryFn: () =>
      getActionResult({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useListSkillsSuspense = <
  TData = Common.ListSkillsDefaultResponse,
  TError = ListSkillsError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<unknown, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseListSkillsKeyFn(clientOptions, queryKey),
    queryFn: () =>
      listSkills({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useListSkillInstancesSuspense = <
  TData = Common.ListSkillInstancesDefaultResponse,
  TError = ListSkillInstancesError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<ListSkillInstancesData, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseListSkillInstancesKeyFn(clientOptions, queryKey),
    queryFn: () =>
      listSkillInstances({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useListSkillTriggersSuspense = <
  TData = Common.ListSkillTriggersDefaultResponse,
  TError = ListSkillTriggersError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<ListSkillTriggersData, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseListSkillTriggersKeyFn(clientOptions, queryKey),
    queryFn: () =>
      listSkillTriggers({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useGetSettingsSuspense = <
  TData = Common.GetSettingsDefaultResponse,
  TError = GetSettingsError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<unknown, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseGetSettingsKeyFn(clientOptions, queryKey),
    queryFn: () =>
      getSettings({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useCheckSettingsFieldSuspense = <
  TData = Common.CheckSettingsFieldDefaultResponse,
  TError = CheckSettingsFieldError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<CheckSettingsFieldData, true>,
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseCheckSettingsFieldKeyFn(clientOptions, queryKey),
    queryFn: () =>
      checkSettingsField({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useGetSubscriptionPlansSuspense = <
  TData = Common.GetSubscriptionPlansDefaultResponse,
  TError = GetSubscriptionPlansError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<unknown, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseGetSubscriptionPlansKeyFn(clientOptions, queryKey),
    queryFn: () =>
      getSubscriptionPlans({ ...clientOptions }).then(
        (response) => response.data as TData,
      ) as TData,
    ...options,
  });
export const useGetSubscriptionUsageSuspense = <
  TData = Common.GetSubscriptionUsageDefaultResponse,
  TError = GetSubscriptionUsageError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<unknown, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseGetSubscriptionUsageKeyFn(clientOptions, queryKey),
    queryFn: () =>
      getSubscriptionUsage({ ...clientOptions }).then(
        (response) => response.data as TData,
      ) as TData,
    ...options,
  });
export const useListModelsSuspense = <
  TData = Common.ListModelsDefaultResponse,
  TError = ListModelsError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<unknown, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseListModelsKeyFn(clientOptions, queryKey),
    queryFn: () =>
      listModels({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
export const useServeStaticSuspense = <
  TData = Common.ServeStaticDefaultResponse,
  TError = ServeStaticError,
  TQueryKey extends Array<unknown> = unknown[],
>(
  clientOptions: Options<unknown, true> = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseServeStaticKeyFn(clientOptions, queryKey),
    queryFn: () =>
      serveStatic({ ...clientOptions }).then((response) => response.data as TData) as TData,
    ...options,
  });
