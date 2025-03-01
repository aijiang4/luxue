import { UserSettings } from '@refly-packages/openapi-schema';
import { User as UserModel, Subscription as SubscriptionModel } from '@prisma/client';
import { pick } from '@refly-packages/utils';
import { subscriptionPO2DTO } from '@/subscription/subscription.dto';

export const userPO2Settings = (
  user: UserModel & { subscription: SubscriptionModel },
): UserSettings => {
  return {
    ...pick(user, [
      'uid',
      'avatar',
      'name',
      'nickname',
      'email',
      'uiLocale',
      'outputLocale',
      'customerId',
      'hasBetaAccess',
    ]),
    preferences: JSON.parse(user.preferences ?? '{}'),
    onboarding: JSON.parse(user.onboarding ?? '{}'),
    subscription: user.subscription ? subscriptionPO2DTO(user.subscription) : null,
  };
};
