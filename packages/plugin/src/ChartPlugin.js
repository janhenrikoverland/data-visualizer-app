import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { createChart } from 'd2-charts-api';

import { apiFetchVisualization } from './api/visualization';
import {
    apiFetchAnalytics,
    apiFetchAnalyticsForYearOverYear,
} from './api/analytics';
import { isYearOverYear } from './modules/chartTypes';
import { getOptionsForRequest } from './modules/options';
import { computeGenericPeriodNames } from './modules/analytics';
import { BASE_FIELD_YEARLY_SERIES } from './modules/fields/baseFields';
import LoadingMask from './widgets/LoadingMask';

class ChartPlugin extends Component {
    constructor(props) {
        super(props);

        this.canvasRef = React.createRef();

        this.recreateChart = Function.prototype;

        this.state = {
            isLoading: true,
        };
    }

    componentDidMount() {
        this.renderChart();
    }

    componentDidUpdate(prevProps) {
        if (this.props.config !== prevProps.config) {
            this.renderChart();
            return;
        }

        if (this.props.filters !== prevProps.filters) {
            this.renderChart();
            return;
        }

        if (this.props.id !== prevProps.id) {
            this.recreateChart(0); // disable animation
            return;
        }
    }

    getRequestOptions = (visualization, filters) => {
        const options = getOptionsForRequest().reduce(
            (map, [option, props]) => {
                // only add parameter if value !== default
                if (visualization[option] !== props.defaultValue) {
                    map[option] = visualization[option];
                }

                return map;
            },
            {}
        );

        // interpretation filter
        if (filters.relativePeriodDate) {
            options.relativePeriodDate = filters.relativePeriodDate;
        }

        // global filters
        if (filters.userOrgUnit) {
            options.userOrgUnit = filters.userOrgUnits;
        }

        return options;
    };

    getConfigById = id => {
        return apiFetchVisualization('chart', id);
    };

    renderChart = async () => {
        const {
            config,
            filters,
            onResponsesReceived,
            onChartGenerated,
            onError,
        } = this.props;

        try {
            const visualization =
                Object.keys(config).length === 1
                    ? await this.getConfigById(config.id)
                    : config;

            const options = this.getRequestOptions(visualization, filters);

            const extraOptions = {};
            let responses = [];

            if (isYearOverYear(visualization.type)) {
                let yearlySeriesLabels = [];

                ({
                    responses,
                    yearlySeriesLabels,
                } = await apiFetchAnalyticsForYearOverYear(
                    visualization,
                    options
                ));

                extraOptions[BASE_FIELD_YEARLY_SERIES] = yearlySeriesLabels;
                extraOptions.xAxisLabels = computeGenericPeriodNames(responses);
            } else {
                responses = await apiFetchAnalytics(visualization, options);
            }

            if (responses.length) {
                onResponsesReceived(responses);
            }

            this.recreateChart = animation => {
                const chartConfig = createChart(
                    responses,
                    visualization,
                    this.canvasRef.current,
                    {
                        ...extraOptions,
                        animation,
                    }
                );

                onChartGenerated(
                    chartConfig.chart.getSVGForExport({
                        sourceHeight: 768,
                        sourceWidth: 1024,
                    })
                );
            };

            this.recreateChart();

            this.setState({ isLoading: false });
        } catch (error) {
            onError(error);
        }
    };

    render() {
        return (
            <Fragment>
                {this.state.isLoading ? <LoadingMask /> : null}
                <div ref={this.canvasRef} style={{ height: '100%' }} />
            </Fragment>
        );
    }
}

ChartPlugin.defaultProps = {
    config: {},
    filters: {},
    animation: 200,
    onError: Function.prototype,
    onChartGenerated: Function.prototype,
    onResponsesReceived: Function.prototype,
};

ChartPlugin.propTypes = {
    id: PropTypes.string,
    animation: PropTypes.number,
    config: PropTypes.object.isRequired,
    filters: PropTypes.object,
    onError: PropTypes.func.isRequired,
    onChartGenerated: PropTypes.func,
    onResponsesReceived: PropTypes.func,
};

export default ChartPlugin;
