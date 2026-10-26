// Only reserved, fictitious public memories receive these fixtures.
// They never attach to user-created, private, or unlisted records.
const id=(n:number)=>`20000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const originals:[number,string][]=[[1,'demo-user-1'],[2,'demo-user-2'],[5,'demo-user-3'],[6,'demo-user-1'],[7,'demo-user-2'],[8,'demo-user-3'],[9,'demo-user-1'],[10,'demo-user-2'],[11,'demo-user-3'],[12,'demo-user-1'],[15,'demo-user-3']];
const writings:Record<number,[string,string]>={
  1:['시험이 끝나고도 바로 집에 가기 아쉬웠던 마음이 떠올라요.','별것 아닌 농담을 오래 기억하게 되는 날이 있더라고요.'],
  2:['파도 소리는 집에 돌아온 뒤에도 한참 귀에 남곤 해요.','다음에는 조금 덜 바쁘게 걸어 보고 싶은 길이에요.'],
  5:['오래 앉아 있던 벤치가 여행의 중심이 되기도 하네요.','가족끼리 걷다가 나눈 작은 농담이 더 오래 남았어요.'],
  6:['생각을 멈추려 애쓰기보다 페달을 밟는 게 편한 날이 있어요.','답을 찾지 못했어도 돌아오는 마음이 달랐다면 충분할 것 같아요.'],
  7:['늘 지나던 길이 어느 날 완전히 달라 보이는 순간이 좋아요.','사진보다 눈으로 오래 담고 싶었던 마음이 전해져요.'],
  8:['오랜만에 만나도 예전 별명부터 나오는 사이가 있죠.','헤어진 뒤에도 한참 웃음이 남았을 것 같아요.'],
  9:['비가 그친 뒤의 냄새는 그날을 한꺼번에 데려오곤 해요.','서두르지 않고 걷는 오후가 문득 그리워지네요.'],
  10:['골목에 불이 하나씩 켜질 때 걷는 걸 좋아해요.','누굴 기다렸는지보다 그날의 마음이 남는다는 말이 기억에 남아요.'],
  11:['수업이 끝나고도 천천히 걷던 날들이 생각나요.','평범했던 오후가 나중에는 가장 선명해지더라고요.'],
  12:['해가 진 다음의 모래사장은 조금 더 조용해서 좋아요.','신발 속 모래까지 같이 떠오르는 이야기네요.'],
  15:['아무 말 없이 앉아 있어도 괜찮은 벤치가 있죠.','따뜻한 햇빛을 잠깐 빌려 쉬어 가는 기분이 들어요.'],
  20:['강 건너 불빛이 켜지는 동안 조금 더 머무르고 싶어요.','집으로 가던 길을 괜히 돌아가고 싶은 저녁이 있죠.'],
  21:['다음 여행을 약속하는 대화만으로도 기분이 달라져요.','바다 앞에서는 멀리 있는 계획도 조금 가까워지는 것 같아요.'],
  22:['도시가 조용해지는 시간을 함께 걸어 본 기분이에요.','그날의 공기가 문장 사이에 남아 있네요.'],
  23:['누군가를 기다리며 본 골목이 오래 기억나기도 해요.','약속 전의 짧은 시간이 한 장면처럼 떠올라요.'],
  24:['개강 전날의 아쉬움과 설렘을 같이 떠올렸어요.','해야 할 일보다 오늘의 햇빛을 먼저 생각한 날 같네요.'],
  25:['끝내 말하지 못한 마음은 어떤 장소에 남는 것 같아요.','다시 그곳을 걸으면 조금은 다르게 말할 수 있을까요.'],
  26:['비를 피하느라 멈췄던 시간이 더 선명하게 남기도 해요.','벤치 하나가 하루의 속도를 바꿔 놓았네요.'],
  27:['매일 걷던 길에서도 처음 보는 장면을 만날 때가 있어요.','작은 것을 발견한 날에는 돌아오는 길도 조금 달라 보이죠.'],
  28:['괜한 농담을 나누며 걷던 저녁이 떠올라요.','강바람보다 그날의 웃음이 먼저 기억날 것 같아요.'],
  29:['조금 돌아가도 좋은 길이 있다는 게 다행이에요.','천천히 걸었다는 사실만으로 편안해지는 날이 있죠.'],
  30:['계절이 끝나기 전에 한 번 더 보고 싶은 풍경이 있어요.','짧게 적어 둔 메모가 여름을 오래 붙잡아 주네요.'],
  31:['같은 곳을 다시 찾았는데 마음은 달라져 있기도 하죠.','처음 걸었을 때와 지금의 풍경을 나란히 떠올려 봤어요.'],
};
const fixtures=[...originals,...Array.from({length:12},(_,index)=>[20+index,`demo-user-${index%3+1}`] as [number,string])].map(([n,ownerId])=>({memoryId:id(n),ownerId,n}));
export const demoComments=fixtures.flatMap(({memoryId,ownerId,n})=>(writings[n]??[]).map((content,index)=>({
  id:`40000000-0000-4000-8000-${String(n).padStart(9,'0')}${String(index+1).padStart(3,'0')}`,
  memoryId,memoryOwnerId:ownerId,ownerId:`demo-comment-${index+1}`,content,
  createdAt:`2026-10-${index===0?'20':'21'}T09:00:00.000Z`,index,
})));
export function demoCommentsForMemory(memoryId:string){return demoComments.filter(comment=>comment.memoryId===memoryId);}
export function demoCommentIndex(memoryId:string,commentId:string){return demoComments.find(comment=>comment.memoryId===memoryId&&comment.id===commentId)?.index??null;}
