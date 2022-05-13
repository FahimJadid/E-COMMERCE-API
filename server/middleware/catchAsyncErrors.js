export default (funcForAsync) => (req, res, next) => {
  Promise.resolve(funcForAsync(req, res, next)).catch(next);
};
