import { getConnection } from 'typeorm';

/**
 * Useful to select only the fields the GraphQL request has selected.
 * Maps same named fields to column names that exist in the model
 *
 * @param entity BaseEntity
 * @param info @Info()
 */
export const mapAttributes = (entity: any, info: any) => {
  const { fieldNodes } = info;
  // get the fields of the Model (columns of the table)
  const columns = getConnection()
    .getMetadata(entity)
    .ownColumns.map(column => column.propertyName);
  const requestedAttributes = fieldNodes[0].selectionSet.selections.map(
    (selection: any) => selection.name.value
  );
  // filter the attributes against the columns
  return requestedAttributes.filter((attribute: any) =>
    columns.includes(attribute)
  );
};
