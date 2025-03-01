import { EntityType, SimpleEventName } from '@refly-packages/openapi-schema';

export interface SimpleEventData {
  uid: string;
  name: SimpleEventName;
  entityType: EntityType;
  entityId: string;
}
