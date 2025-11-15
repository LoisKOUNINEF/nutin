const obj = {
  add(a, b) {
    return a + b;
  }
}

describe('assertions', () => {
  it('should check if value matches expected', () => {
    const five = obj.add(2,3);
    const ten = obj.add(3,7);
    const object = { five: five, ten: ten };
    const arr = [ five, ten ];

    expect(five).toEqual(5);
    expect(five).toBe(5);
    expect(ten).not.toEqual(11);
    expect(ten).not.toBe(11);
    expect(object).toEqual({ five: five, ten: ten });
    expect(object).not.toBe({ five: five, ten: ten });
    expect(arr).toEqual([five, ten]);
    expect(arr).not.toBe([five, ten]);
  });
  it('should check if function has been called', () => {
    const spy = spyOn(obj, 'add');
    const empty = () => {};
    obj.add(2,3);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(2,3);
    expect(spy).not.toHaveBeenCalledWith(10,11);
    expect(empty).not.toHaveBeenCalled();
  });
  it('should check if an element is defined', async () => {
    expect('string').toBeDefined();
    expect('string').not.toBeUndefined();
    expect(null).toBeUndefined();
    expect(null).not.toBeDefined();
  });
  it('should check for if an element is true / false', () => {
    const isTrue = 1 == '1';
    const isFalse = 1 === '1';
    expect(isTrue).toBeTruthy();
    expect(isFalse).toBeFalsy();
  });
  it('should check if substring is contained within string', () => {
    const str1 = 'Creativity is allowing yourself to make mistakes.';
    const str2 = 'Art is knowing which ones to keep.';
    const subStr1 = 'wing yours';
    const subStr2 = 'wing which';
    expect(str1).toContain(subStr1);
    expect(str2).toContain(subStr2);
    expect(str1).not.toContain(str2);
  });
  it('should check for instance', () => {
    const date = new Date();
    const fn = () => {};
    expect(date).toBeInstanceOf(Date);
    expect(fn).toBeInstanceOf(Function);
    expect(date).not.toBeInstanceOf(Function);
    expect(fn).not.toBeInstanceOf(Date);
  });
  it('should check for error throw', () => {
    const err = () => { throw new Error('message'); };
    const notErr = () => {};
    expect(err).toThrow();
    expect(err).toThrow('message');
    expect(err).not.toThrow('another message');
    expect(notErr).not.toThrow();
    expect(notErr).not.toThrow('messsage');
  });
});
