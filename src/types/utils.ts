export type SetRequired<BaseType, Keys extends keyof BaseType> = Omit<BaseType, Keys> & Required<Pick<BaseType, Keys>>;
