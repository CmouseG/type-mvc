
import { IPropertyDecorator, createPropDecorator, MetadataExtends, MetadataAdapter, isString, isUndefined, isBoolean } from '@ts-ioc/core';
import { FieldMetadata } from '../metadata';


/**
 * Field Decorator. define filed as model filed.
 *
 * @export
 * @interface IFiledDecorator
 * @template T
 */
export interface IFiledDecorator<T extends FieldMetadata> extends IPropertyDecorator<T> {
    /**
     * Field Decorator. define filed as model filed.
     * @Field
     *
     * @param {string} [dbtype] field db type.
     * @param {string} [dbfield] db field name to storage the model type.
     * @param {*} [defaultValue] default value to storage.
     * @param {boolean} [required] define the db filed is must required.
     */
    (dbtype?: string, dbfield?: string, defaultValue?: any, required?: boolean): PropertyDecorator;
}


/**
 * create filed decorator.
 *
 * @export
 * @template T
 * @param {string} [fieldType]
 * @param {MetadataAdapter} [adapter]
 * @param {MetadataExtends<T>} [metaExtends]
 * @returns {IFiledDecorator<T>}
 */
export function createFieldDecorator<T extends FieldMetadata>(
    fieldType?: string,
    adapter?: MetadataAdapter,
    metaExtends?: MetadataExtends<T>): IFiledDecorator<T> {
    return createPropDecorator<FieldMetadata>('Field',
        args => {
            if (adapter) {
                adapter(args);
            }
            args.next<FieldMetadata>({
                match: (arg) => isString(arg),
                setMetadata: (metadata, arg) => {
                    metadata.dbtype = arg;
                }
            });

            args.next<FieldMetadata>({
                match: (arg) => isString(arg),
                setMetadata: (metadata, arg) => {
                    metadata.dbfield = arg;
                }
            });

            args.next<FieldMetadata>({
                match: (arg) => isUndefined(arg),
                setMetadata: (metadata, arg) => {
                    metadata.defaultValue = arg;
                }
            });

            args.next<FieldMetadata>({
                match: args => isBoolean(args),
                setMetadata: (metadata, arg) => {
                    metadata.required = arg;
                }
            });
        },
        metadata => {
            if (!metadata.dbfield) {
                metadata.dbfield = metadata.propertyKey.toString();
            }
            if (metaExtends) {
                metadata = metaExtends(metadata as T);
            }
            metadata.fieldType = fieldType;
            return metadata;
        }) as IFiledDecorator<T>;
}

/**
 * Field Decorator. define filed as model filed.
 */
export const Field: IFiledDecorator<FieldMetadata> = createFieldDecorator<FieldMetadata>();

