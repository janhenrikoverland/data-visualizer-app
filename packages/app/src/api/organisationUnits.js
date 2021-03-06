import { getInstance } from 'd2';
import { onError } from './index';

export const apiFetchOrganisationUnitRoot = () => {
    const endPoint = '/organisationUnits';
    const fields = ['id', 'displayName', 'name'];
    const url = `${endPoint}?paging=false&userDataViewFallback=true&fields=${fields.join(
        ','
    )}`;

    return getInstance()
        .then(d2 => d2.Api.getApi().get(url))
        .then(({ organisationUnits }) => organisationUnits[0])
        .catch(onError);
};

/**
 * Fetch organisation units
 * @returns {Promise<T | never>}
 */
export const apiFetchOrganisationUnits = displayNameProperty => {
    const fields = [
        'id',
        'path',
        `${displayNameProperty}~rename(displayName)`,
        'children::isNotEmpty',
    ];

    return getInstance().then(d2 =>
        d2.models.organisationUnits.list({
            paging: false,
            level: 1,
            fields: fields.join(','),
        })
    );
};

/**
 * Fetch organisation unit groups
 * @returns {*}
 */
export const apiFetchOrganisationUnitGroups = displayNameProperty => {
    const endPoint = '/organisationUnitGroups';
    const fields = ['id', `${displayNameProperty}~rename(displayName)`, 'name'];
    const url = `${endPoint}?paging=false&fields=${fields.join(',')}`;

    return getInstance()
        .then(d2 => d2.Api.getApi().get(url))
        .then(({ organisationUnitGroups }) => organisationUnitGroups)
        .catch(onError);
};

/**
 * Fetch organisation unit levels
 * @returns {*}
 */
export const apiFetchOrganisationUnitLevels = () => {
    const endPoint = '/organisationUnitLevels';
    const fields = ['id', 'displayName', 'name', 'level'];
    const url = `${endPoint}?paging=false&fields=${fields.join(',')}`;

    return getInstance()
        .then(d2 => d2.Api.getApi().get(url))
        .then(({ organisationUnitLevels }) => organisationUnitLevels)
        .catch(onError);
};
