import * as assert from 'assert';
import { Heap, newHeap, Comparator } from './heap';


const INT_CMP: Comparator<number> = (a: number, b: number): number => a - b;
const STR_CMP: Comparator<string> = (a: string, b: string): number => {
  return (a < b) ? -1 : (a > b) ? +1 : 0;
};


const checkInsertRemove = <E>(
    cmp: Comparator<E>, insertOrder: Array<E>, removeOrder: Array<E>): void => {

  const h: Heap<E> = newHeap<E>(cmp);
  assert.strictEqual(h.isEmpty(), true)

  for (const toInsert of insertOrder) {
    h.add(toInsert);
    assert.strictEqual(h.isEmpty(), false)
  }

  for (const toRemove of removeOrder) {
    assert.strictEqual(h.isEmpty(), false)
    assert.strictEqual(h.removeMin(), toRemove);
  }

  assert.strictEqual(h.isEmpty(), true)
};


describe('heap', function() {

  it('numbers', function() {
    checkInsertRemove(INT_CMP, [1], [1]);

    checkInsertRemove(INT_CMP, [1, 2], [1, 2]);
    checkInsertRemove(INT_CMP, [2, 1], [1, 2]);

    checkInsertRemove(INT_CMP, [1, 2, 3], [1, 2, 3]);
    checkInsertRemove(INT_CMP, [1, 3, 2], [1, 2, 3]);
    checkInsertRemove(INT_CMP, [2, 1, 3], [1, 2, 3]);
    checkInsertRemove(INT_CMP, [2, 3, 1], [1, 2, 3]);
    checkInsertRemove(INT_CMP, [3, 1, 2], [1, 2, 3]);
    checkInsertRemove(INT_CMP, [3, 2, 1], [1, 2, 3]);

    checkInsertRemove(INT_CMP, [1, 2, 3, 4], [1, 2, 3, 4]);
    checkInsertRemove(INT_CMP, [3, 1, 2, 4], [1, 2, 3, 4]);
    checkInsertRemove(INT_CMP, [4, 3, 2, 1], [1, 2, 3, 4]);

    checkInsertRemove(INT_CMP, [1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);
    checkInsertRemove(INT_CMP, [5, 1, 4, 2, 3], [1, 2, 3, 4, 5]);
    checkInsertRemove(INT_CMP, [5, 4, 3, 2, 1], [1, 2, 3, 4, 5]);

    checkInsertRemove(INT_CMP, [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6]);
    checkInsertRemove(INT_CMP, [2, 6, 1, 4, 5, 3], [1, 2, 3, 4, 5, 6]);
    checkInsertRemove(INT_CMP, [6, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 6]);

    checkInsertRemove(INT_CMP, [1, 2, 3, 4, 5, 6, 7], [1, 2, 3, 4, 5, 6, 7]);
    checkInsertRemove(INT_CMP, [1, 2, 3, 5, 6, 7, 4], [1, 2, 3, 4, 5, 6, 7]);
    checkInsertRemove(INT_CMP, [7, 6, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 6, 7]);

    checkInsertRemove(INT_CMP, [1, 2, 3, 4, 5, 6, 7, 8], [1, 2, 3, 4, 5, 6, 7, 8]);
    checkInsertRemove(INT_CMP, [1, 8, 2, 7, 4, 6, 3, 5], [1, 2, 3, 4, 5, 6, 7, 8]);
    checkInsertRemove(INT_CMP, [8, 7, 6, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('strings', function() {
    checkInsertRemove(STR_CMP,
        ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    checkInsertRemove(STR_CMP,
        ['g', 'f', 'e', 'd', 'c', 'b', 'a'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    checkInsertRemove(STR_CMP,
        ['b', 'd', 'f', 'g', 'a', 'c', 'e'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    checkInsertRemove(STR_CMP,
        ['a', 'c', 'e', 'g', 'b', 'd', 'f'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'g']);
  });

});
