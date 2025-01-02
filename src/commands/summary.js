import summaryService from '../services/summaryService.js';

const summary = async () => {
  const tR = await summaryService.summaryByTask();
  // console.log(tR);
};

export {summary};
