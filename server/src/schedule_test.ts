import * as assert from 'assert';
import { hoursAfter, indexAtHour, Schedule } from './schedule';


describe('schedule', function() {

  it('hoursAfter', function() {
    assert.deepStrictEqual(hoursAfter("8:30"),
        ["9:30", "10:30", "11:30", "12:30", "1:30", "2:30", "3:30", "4:30", "5:30"]);
    assert.deepStrictEqual(hoursAfter("11:30"),
        ["12:30", "1:30", "2:30", "3:30", "4:30", "5:30"]);
    assert.deepStrictEqual(hoursAfter("12:30"),
        ["1:30", "2:30", "3:30", "4:30", "5:30"]);
    assert.deepStrictEqual(hoursAfter("1:30"),
        ["2:30", "3:30", "4:30", "5:30"]);
    assert.deepStrictEqual(hoursAfter("5:30"), []);
  });

  it('indexAtHour', function() {
    const schedule: Schedule = [
        {hour: "11:30", location: "MLR", desc: "CSE 331"},
        {hour: "12:30", location: "HUB", desc: "lunch"},
        {hour: "1:30", location: "SUZ", desc: "studying"},
        {hour: "2:30", location: "CS2", desc: "CSE 311"},
      ];
    assert.deepStrictEqual(indexAtHour(schedule, "10:30"), -1);
    assert.deepStrictEqual(indexAtHour(schedule, "11:30"), 0);
    assert.deepStrictEqual(indexAtHour(schedule, "12:30"), 1);
    assert.deepStrictEqual(indexAtHour(schedule, "1:30"), 2);
    assert.deepStrictEqual(indexAtHour(schedule, "2:30"), 3);
    assert.deepStrictEqual(indexAtHour(schedule, "3:30"), -1);
  });

});
