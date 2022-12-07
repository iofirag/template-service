import { container } from "../containerConfig";
import { TYPES } from '../containerTypes';

const example1Service: any = container.get(TYPES.Example1Service);

export const addExample = example1Service.addExample.bind(example1Service)