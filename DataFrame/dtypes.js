/**
 * dtype
 * =======================
 *
 * Extends the jsonArray functionality to allow for data type
 * formatting. This includes extracting data types for specific
 * columns and also converting to known data types
 *
 * :Author: Nik Sumikawa
 * :Date: Aug 4, 2020
 */


// import datetime from './datetime'



class dtypes extends Object{

  constructor(series) {
    super()

    this.dtype = 'unknown'

    // when provided, parse the data type from the series
    if( series !== undefined ) this.dtype = this.parse( series )

  }
  //
  // get dtype(){return this.dtype}
  // set dtype( val ){
  //   console.log( 'do i get here??')
  //   this.dtype = val}


  // compares two data types and returns the one with the
  // highest priority to avoid type conflict
  dtypePriority( dtype1, dtype2 ){
     const priority = [
       'object',
       'array',
       'string',
       'float',
       'int',
       'boolean',
     ]

     for( var i=0; i < priority.length; i++ ){
       if( dtype1 === priority[i] ) return priority[i]
       if( dtype2 === priority[i] ) return priority[i]
     }

     return 'unknown'
  }



  /**
   * returns the data type for the given value
   * @param  {variable} value variable
   * @return {string}         data type of the provided varaible
   */
  valueType( value ){

    if( value instanceof Array ) return 'array'
    if( value instanceof Object ) return 'object'


    if( (Number(value) === value)&(value % 1 === 0) ) return 'int'
    if( (Number(value) === value)&(value % 1 !== 0) ) return 'float'

    // attempt to convert the value to a number
    const numeric = Number( value )

    // determine the proper type when successfully converted to a number
    if( numeric !== undefined & !isNaN(numeric) ){
      if( value === true | value === false ) return 'boolean'
      if( value % 1 === 0 ) return 'intString'
      if( value % 1 !== 0 ) return 'floatString'
    }

    if(value === 'true' | value === 'false') return 'booleanString'
    if(typeof value === 'string' || value instanceof String) return 'string'

    return 'unknown'
  }

  /**
   * Returns the data type for the provided series
   * @param  {Object} series Series object
   * @return {String}        Data type string
   */
  parse( series ){

    var dtype = 'unknown'
    for (var [key, value] of Object.entries(series)) {
      if( value === undefined ) continue

      var temp_dtype = this.valueType( value )

      // set the dtype based on the priority when the cell dtype
      // differs from the global definition
      if( dtype !== temp_dtype ){
        dtype = this.dtypePriority( dtype, temp_dtype)
      }
    }

    return dtype
  }

  /**
   * returns True when the data type is numeric. Otherwise False
   * @param  {String}  dtype Data type string
   * @return {Boolean}       True when the data type is numeric, otherwise false
   */
  get isNumeric(){
    switch( this.dtype ){
      case 'float' : return true
      case 'int': return true
      case 'percentage': return true
      default : return false
    }
  }



  /**
   * Converts the value to a specific data type based on the user provided dtype
   * @param  {variable} value    variable of various data types
   * @param  {String}   dtype    data type
   * @param  {Object} [props={}] Object containing parameters used during conversion
   * @return {variable}          variable converted to the specified data type
   */
  valueAsType(value, dtype, props={}){

    switch( dtype ){
      case 'moment':
        return new Date(value)

      case 'week':
        return new Date(value).isoWeek()

      case 'strftime':
        if( props.format === undefined ) props['format'] = 'YYYY-MM-DD'
        return datetime(value).format(props['format'])

      case 'int' :
        return Number( value )

      case 'float' :
        return Number( value )

      case 'string' :
        return value.toString()

      case 'boolean' :
        if( value === 'true' ) return true
        if( value === 'false' ) return false
        if( value === false | value === true ) return value
        return Number( value )

      case 'array':
        if( typeof value !== 'string' ) return value
        return value
          .replace(/\[/gi, '')
          .replace(/\]/gi, '')
          .replace(/'/gi, '')
          .replace(/, /gi, ',')
          .split(',');

      default :
        return value
    }

  }


  /**
   * Converts the value to a string based on the internal dtype definition
   * @param  {variable} value    variable of various data types
   * @param  {Object} [props={}] parameters used during the conversion process
   * @return {String}            value converted to string format
   */
  valueToString(value, props={}){

    const resolution = {
      float: 4,
      int: 6,
      percent: 2,
      string: 50,
    }

    var res = resolution[this.dtype]
    if( props.resolution !== undefined ) res = props.resolution

    switch( this.dtype ){
      // limit the resolution of floats. when exceeded default to scientific notation
      case 'float' :
        if( value/Math.pow(10,res-1) > 0 ){
          return value.toFixed(res).toString()
        }
        return value.toExponential(res).toString()

      // limit the resolution of integers. Default to scientic notation when exceeded
      case 'int':
        if( value < Math.pow(10,res-1) ){
          return value.toString()
        }
        return value.toExponential(res).toString()

      // limit the resolution of percent and multiply by 100
      case 'percent':
        return `${(100*value).toFixed(res)}%`


      // limit the resolution of strings to x characters
      case 'string':
        if( value.length > this.string ){
          return `${value.splice(this.string)}...`
        }

        return value

      default :
        value = value.toString()
        if( value.length > this.string ){
          return `${value.splice(this.string)}...`
        }

        return value
    }
  }



  //
  //
  //
  // // set a data type for the specified column
  // parse_column( array, col ){
  //
  //   var dtype
  //   for( var i=0; i < array.length; i++ ){
  //     if( array[i][col] !== undefined ){
  //       // extract the datatype for the current cell
  //       var temp_dtype = this.data_type( array[i][col] )
  //
  //       // set the dtype during the first pass when it's not set
  //       if( dtype === undefined ){
  //         dtype = temp_dtype
  //         continue
  //       }
  //
  //       // set the dtype based on the priority when the cell dtype
  //       // differs from the global definition
  //       if( dtype !== temp_dtype ){
  //         temp_dtype = this.dtypePriority( dtype, temp_dtype)
  //       }
  //
  //       dtype = temp_dtype
  //     }
  //   }
  //
  //   return dtype
  // }
  //
  // // returns an object containing the dtypes for each column
  // parse( array ){
  //
  //   // parse a unique set of column names from the array of objects
  //   var columns = []
  //   for( var i=0; i < array.length; i++ ){
  //     columns = columns.concat( Object.keys(array[i]))
  //   }
  //   columns = [...new Set(columns)]
  //
  //   // parse the data types for each column
  //   const existing = Object.keys(this)
  //   for( i=0; i < columns.length; i++ ){
  //     // do no overwrite existing datatypes
  //     if( existing.includes(columns[i]) ) continue
  //
  //     //parse undefined datatypes
  //     this[columns[i]] = this.parse_column(array, columns[i])
  //   }
  //
  //   return this
  // }
  //
  //
  // /**
  //  * Returns the data type for the provided series
  //  * @param  {Object} series Series object
  //  * @return {String}        Data type string
  //  */
  // parse_series( series ){
  //
  //   var dtype
  //   for( var i=0; i < series.values.length; i++ ){
  //
  //     const value = series.values[i]
  //
  //     if( value !== undefined ){
  //       // extract the datatype for the current cell
  //       var temp_dtype = this.data_type( value )
  //
  //       // set the dtype during the first pass when it's not set
  //       if( dtype === undefined ){
  //         dtype = temp_dtype
  //         continue
  //       }
  //
  //       // set the dtype based on the priority when the cell dtype
  //       // differs from the global definition
  //       if( dtype !== temp_dtype ){
  //         temp_dtype = this.dtypePriority( dtype, temp_dtype)
  //       }
  //
  //       dtype = temp_dtype
  //     }
  //   }
  //
  //   return dtype
  // }

}


module.exports = dtypes;
