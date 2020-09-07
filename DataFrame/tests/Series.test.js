/**
 * Series Tests
 * =============
 *
 * Test the various series components
 *
 * @Author Nik Sumikawa
 * @date Sept 6, 2020
 */


import jStat from 'jStat'
import Series from '../Series'

// test the ability to populate the json object from an array
test("Series : from_array", () => {
  const index =  jStat(0,9,10)[0]
  const values = jStat().rand( 1, 10)[0]

  const series = new Series({index: index, values: values})
  expect( series.index.toString() ).toBe( index.toString() );
  expect( series.values.toString() ).toBe( values.toString() );
});

// test the ability to populate the json object from an array
test("Series : astype", () => {
  const index =  jStat(2,11,10)[0]
  const values = jStat().rand( 1, 10)[0]

  var series = new Series({index: index, values: values})
  series = series.astype('string')

  expect( series.index.toString() ).toBe( index.toString() );
  expect( series.values.toString() ).toBe( values.toString() );
});


test("Series : toString", () => {
  const index =  jStat(2,8,7)[0]
  const values = ['one', 'two', 'three', 'four', 'eleven', 'twelve', 'seventeen']

  const exp_values = [
    '      one',
    '      two',
    '    three',
    '     four',
    '   eleven',
    '   twelve',
    'seventeen'
  ]

  const exp_index = [
    '    2', '    3',
    '    4', '    5',
    '    6', '    7',
    '    8'
  ]

  var series = new Series({index: index, values: values})

  expect( series.valueToString.toString() ).toBe( exp_values.toString() );
  expect( series.indexToString.toString() ).toBe( exp_index.toString() );
});


// test the ability to populate the json object from an array
test("Series : unique", () => {
  const index =  jStat(2,8,7)[0]
  const values = ['one', 'one', 'four', 'four', 'eleven', 'one', 'seven']

  var series = new Series({index: index, values: values})


  expect( series.unique().toString() ).toBe( [ 'one', 'four', 'eleven', 'seven' ].toString() );
  expect( series.unique(true).toString() ).toBe( [ 'eleven', 'four', 'one', 'seven' ].toString() );
});
