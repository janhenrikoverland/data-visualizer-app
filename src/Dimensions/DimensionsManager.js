import React, { Fragment } from 'react';
import Button from 'material-ui/Button';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import i18n from '@dhis2/d2-i18n';

import ChartOptions from '../ChartOptions/ChartOptions';

let dimensionsArr = [<ChartOptions />, 'test'];

export const DimensionsManager = ({ index, dialogIsOpen, toggleDialog }) => {
    return (
        <Fragment>
            <Dialog open={dialogIsOpen} onClose={toggleDialog}>
                <DialogTitle>{i18n.t('Chart options')}</DialogTitle>
                <DialogContent>{dimensionsArr[index]}</DialogContent>
                <DialogActions>
                    <Button onClick={toggleDialog}>{i18n.t('Hide')}</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
};

export default DimensionsManager;