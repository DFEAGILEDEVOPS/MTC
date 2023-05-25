import { type ReceivedCheckFunctionBindingEntity, type ReceivedCheckTableEntity } from '../schemas/models'

/**
 * When you retrieve a table storage entity via an Azure functions binding
 * it uses proper casing for the partition and row key property names...
 * PartitionKey and RowKey
 * When you use the @azure/data-tables package, it uses the more standard
 * camel casing of partitionKey and rowKey
 * This service transforms from a function input binding style to the
 * data tables package style
 */
export class ReceivedCheckBindingEntityTransformer {
  transform (entity: ReceivedCheckFunctionBindingEntity): ReceivedCheckTableEntity {
    return {
      partitionKey: entity.PartitionKey,
      rowKey: entity.RowKey,
      archive: entity.archive,
      answers: entity.answers,
      checkReceivedAt: entity.checkReceivedAt,
      checkVersion: entity.checkVersion,
      isValid: entity.isValid,
      mark: entity.mark,
      markedAt: entity.markedAt,
      markError: entity.markError,
      maxMarks: entity.maxMarks,
      processingError: entity.processingError,
      validatedAt: entity.validatedAt
    }
  }
}
