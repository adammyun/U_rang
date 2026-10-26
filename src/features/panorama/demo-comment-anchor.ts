import { demoCommentIndex } from '../memories/demo-comments';
import { screenToAnchor, type PanoramaFrame } from './projection';

/** Fictional examples bind to the actual first scene, never a fabricated pano ID.
 * The initial frame is retained for the viewer lifetime, including zoom/drag.
 * Real user comments keep their persisted scene/direction instead.
 */
export function exampleCommentAnchor(memoryId:string,commentId:string,initialFrame:PanoramaFrame|null){
  const index=demoCommentIndex(memoryId,commentId);
  if(index===null||!initialFrame)return null;
  return screenToAnchor(initialFrame,initialFrame.width*(index===0?.3:.63),initialFrame.height*(index===0?.2:.27));
}
