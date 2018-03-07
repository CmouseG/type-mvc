import { RequestMethod } from '../RequestMethod';
import { createRouteDecorator, IRouteDecorator } from './Route';
import { PostMetadata } from '../metadata/index';


export const Post: IRouteDecorator<PostMetadata> = createRouteDecorator<PostMetadata>(RequestMethod.Post);

