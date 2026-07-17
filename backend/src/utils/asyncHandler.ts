const asyncHandler = (requestHandler: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

export default asyncHandler;