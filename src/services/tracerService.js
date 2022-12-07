const initJaegerTracer = require('jaeger-client').initTracer;
const opentracing = require('opentracing');

module.exports = class Tracer {
    constructor(config, logger, serviceData) {
        this._serviceData = serviceData;
        this._logger = logger;
        const jaegerConfig = {
            serviceName: this._serviceData.name,
            sampler: {
                type: 'const',
                param: 1,
            },
            reporter: {
                logSpans: true,
                agentHost: config.agentHost || 'localhost',
                agentPort: config.agentPort || 6832,
                collectorEndpoint: 'http://jaegercollector:14268/api/traces',
            },
        };
        const options = {};
        this.tracer = initJaegerTracer(jaegerConfig, options);
        this.tracer.initSpan = this.initSpan;
        this.tracer.initFollowsFromSpan = this.initFollowsFromSpan;
        this.tracer.extractFromSpanTags = this.extractFromSpanTags;
        this.tracer.isTagsExists = this.isTagsExists;
        this.tracer.setTags = this.setTags;
        return this.tracer;
    }

    initSpan(spanName, parentSpan = null) {
        let span;
        const startTime = Date.now();
        if (parentSpan) {
            span = this.startSpan(spanName, { childOf: parentSpan, startTime });
        } else {
            span = this.startSpan(spanName, { startTime });
        }
        return span;
    }

    initFollowsFromSpan(spanName, parentSpan = null) {
        let span;
        const startTime = Date.now();
        if (parentSpan) {
            const followsFromRef = opentracing.followsFrom(parentSpan);
            span = this.startSpan(spanName, {
                startTime: startTime,
                references: [followsFromRef],
            });
        } else {
            span = this.startSpan(spanName, { startTime: startTime });
        }
        return span;
    }

    extractFromSpanTags(span, tagsFields = null) {
        const tagFieldsPairs = {};
        if (span && span._tags) {
            if (tagsFields && tagsFields.length) {
                tagsFields.forEach((tagField) => {
                    const tag = span._tags.find((tagItem) => tagItem.key === tagField);
                    if (tag) {
                        tagFieldsPairs[tagField] = tag.value;
                    }
                });
            } else {
                span._tags.forEach((tag) => {
                    tagFieldsPairs[tag.key] = tag.value;
                });
            }
        }
        return tagFieldsPairs;
    }

    isTagsExists(span, tagKey) {
        if (span && span._tags) {
            const tag = span._tags.find((tagItem) => tagItem.key === tagKey);
            if (tag) {
                return true;
            }
            return false;
        }
        throw new Error('span does not declare.');
    }

    setTags(span, obj) {
        if (span) {
            for (const key in obj) {
                if (this.isTagsExists(span, key) === false) {
                    span.setTag(key, obj[key]);
                }
            }
            return span;
        }
    }
};
