//import { Client } from "elasticsearch";
//import { logger } from "..";


//export class ElasticService {
//    public client: Client

//    constructor() {
//        this.connect()
//        this.init()
//    }
    
//    private async connect() {
//        try {
//            const hostList: string[] = JSON.parse(process.env.ELASTIC_URL_LIST)
//            this.client = new Client({
//                hosts: hostList,
//                log: 'trace',
//                maxRetries: 5,
//                requestTimeout: 120000,
//            })
//            logger.verbose('Elasticsearch client connected.')
//        } catch(error) {
//            logger.error('Error happend while connecting to elasticsearch', error.message)
//        }
//	}
//    private async init() {
//        try {
//            // Create index & mapping types
//            await this.client.indices.create({
//                index: process.env.ELASTIC_INDEX_KEY,
//                body: {
//                    mappings: {
//                        properties: GarbageElasticMappingType,
//                    },
//                    settings: {
//                        final_pipeline: process.env.ELASTIC_INGEST_PIPELINE_KEY
//                    }
//                }
//            })
//            logger.verbose(`success create ${process.env.ELASTIC_INDEX_KEY} index`)
//        } catch(error) {
//            logger.verbose(`error: create index, ${error}`)
//            logger.error(`error: index ${process.env.ELASTIC_INDEX_KEY} already exist`)
//        }
//        try {
//            // Create pipeline
//            await this.client.ingest.putPipeline({
//                id: process.env.ELASTIC_INGEST_PIPELINE_KEY,
//                body: {
//                    description: `Creates ${process.env.ELASTIC_INGEST_PIPELINE_KEY} pipeline when a document is initially indexed`,
//                    processors: [{
//                        set: {
//                            field: '_source.timestamp',
//                            value: '{{_ingest.timestamp}}'
//                        }
//                    }]
//                }
//            })
//            logger.verbose(`success create pipeline`)
//        } catch(error) {
//            logger.error(`pipeline: ${process.env.ELASTIC_INGEST_PIPELINE_KEY} already exist`)
//        }
//    }
//    public async reset() {
//        try {
//            // Delete pipeline
//            this.client.ingest.deletePipeline({ id: process.env.ELASTIC_INGEST_PIPELINE_KEY })
//            logger.verbose(`delete elastic pipeline`)
//        } catch (error) {
//            logger.error(error)
//        }
//        try {
//            // Delete index
//            this.client.indices.delete({ index: process.env.ELASTIC_INDEX_KEY })
//            logger.verbose(`delete elastic index`)
//        } catch (error) {
//            logger.error(error)
//        }
//    }

//    public async getByCondition(indexKey, docType, queryData) {
//        const searchRes: any = await this.search(indexKey, docType, queryData)
//        return searchRes.hits.hits
//    }
    
//    public async create(index: string, type: string, body: any) {
//        return await this.client.index({
//            index,
//            type,
//            refresh: 'wait_for',
//            body,
//        })
//    }

//    public async search(index: string, type: string, queryData: any) {
//        return await this.client.search({
//            index,
//            type,
//            body: { 
//                query: queryData
//            }
//        })
//    }

//    public async update(index: string, type: string, id: string, updateData: any) {
//        return await this.client.update({
//            index,
//            type,
//            id,
//            refresh: 'wait_for',
//            body: {
//                doc: updateData,
//            }
//        })
//    }

//    public async delete(index: string, type: string, id: string) {
//        return await this.client.delete({
//            index,
//            type,
//            refresh: 'wait_for',
//            id
//        })
//    }

//    // public async function getById(id: string): Promise<any> {
//    //     if (!id) throw 'missing id'
//    //     return await this.client.get({
//    //         index: process.env.ELASTIC_INDEX_KEY,
//    //         type: process.env.ELASTIC_DOC_TYPE,
//    //         id,
//    //     })
//    // }
//}

//export const GarbageElasticMappingType = {
//    id: {type: "integer"},
//    color: {type: "keyword"},
//    type: {type: "keyword"},
//    location: {type: 'geo_point'},
//    emptyDate: {type: "date", format: "epoch_millis"},
//    timestamp: {type: "date", /*format: "epoch_millis"*/},
//}