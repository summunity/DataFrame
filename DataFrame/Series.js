/**
 * Series
 * ===============
 *
 * A series is an object containing an index and value for each sample.
 * The object is extended to include metadata including data type, name
 * and other descriptive variables. The purpose is to consolidate all
 * information describing a single data source.
 *
 * :Author: Nik Sumikawa
 * :Date: Sept 5, 2020
 */


const dtypes = require('./dtypes')

class Series extends Object {

  constructor(props={}) {
    super()

    const keys = Object.keys(props)

    // determine the inpute data type based on the props parameters
    var inputType
    if( keys.includes('values') ) inputType = 'Array'
    if( keys.includes('object') ) inputType = 'Object'

    // populate the local object variables based on the inputType
    switch( inputType ){
      case 'Array':
        this.from_array(props.values, props.index )
        break

      case 'Object':
        this.from_object( props.object )
        break

      default:
        this.from_object( props )
        break
    }


    //
    // // allow for mixed datatype, referenced by the keys.
    // // This is only applicable when the data types are provided.
    // // Otherwise, it is assumed that the data is from a single
    // // data type which will be parsed out
    // if( props.dtypes !== undefined ){
    //   this.dtypes = props.dtypes
    //   this.dtype = 'mixed'
    //
    // }else{
    //   this.dtype = props.dtype
    //
    //   // parse the data type from the data when one is not provided
    //   if( this.dtype === undefined ){
    //     this.dtype = new DataTypes().parse_series( this )
    //   }
    //
    // }
    this.dtype = new dtypes(this)

    this.name = props.name

    // this.dtype.parse_series( this )
  }


  // returns the series index
  get index(){
    return Object.keys(this.data(false))
  }

  // returns the series values
  get values(){
    return Object.values(this.data(false))
  }

  // overwrites the current set of values with those provided in the array
  set values( values ){
    const keys = this.index
    for( var i=0; i < keys.length; i++ ){
        this[keys[i]] = values[i]
    }
  }

  /**
   * Removes the metadata and returns an object containing the data
   * @param  {Boolean} [inplace=false] When true, the data is copied to avoid mutation
   * @return {object}                  Object containing the data only
   */
  data( inplace=false){

    var data = this
    if(inplace === false) data = {...this}

    delete data.dtype
    delete data.name

    return data
  }

  /**
   * Converts the series to the specified data type
   * @param  {String} dtype      data type definition
   * @param  {Object} [props={}] object containing parameters for type conversion
   * @return {Object}            Series converted to the specified data type
   */
  astype( dtype, props={} ){
    var data = this
    if(props.inplace === false) data = new Series(this)

    data.dtype.dtype = dtype
    const func = data.dtype.valueAsType
    data.values = data.values.map( val => func(val, dtype, props))
    return data
  }


  /**
   * Populates the object from data provided as an array type. The
   * index array is assigned to the object key when it's provided.
   * The values are assigned a key in numberical order when the Index
   * array is not provided
   * @param  {Array} value Array of values
   * @param  {Array} index Array of indicies
   * @return {Object}      Object where each value is assigned an index
   */
  from_array( value, index ){
    if( value === undefined ){
      console.log( 'warning - from_array - no values provided ')
      return
    }

    // Assign each value and index vased on the index array
    if( index !== undefined ){
      for( var i=0; i < index.length; i++ ){
        this[index[i]] = value[i]
      }
      return this
    }

    // Assign each value an index in numerical order
    for( var i=0; i < value.length; i++ ){
      this[i] = value[i]
    }

    return this

  }


  /**
   * Copy the content of the object to local variables
   * @param  {Object} obj Input object containing data and indicies
   * @return {object}     Object based on data stored locally
   */
  from_object( obj ){
    for (var [key, value] of Object.entries(obj)) {
      this[key] = value
    }

    return this
  }

  /**
   * Converts the Series values to strings with whitespace, where each
   * value has the exact same string length
   * @return {Array} Array of strings with whitespace to achieve the same length
   */
  get valueToString(){
    // convert the Series values to strings
    const valueArray = this.values.map( row => this.dtype.valueToString(row) )

    // set a default series name when it is not defined
    const name = (this.name === undefined ? '' : this.name)

    // compute the maximum string length of the Series
    const maxLength = Math.max(
      name,
      ...(valueArray.map(row => row.length) )
    )

    const valueString = valueArray.map(
      val => new Array(maxLength - val.length + 1).join(' ') + val
    )

    return valueString
  }

  /**
   * Converts the Series index to strings with whitespace, where each
   * index has the exact same string length
   * @return {Array} Array of strings with whitespace to achieve the same length
   */
  get indexToString(){
    // convert the Series index to strings
    const maxLength = Math.max( 5, ...this.index.map( row => this.dtype.valueToString(row).length ))

    const indexString = this.index.map(
      val => new Array(maxLength - val.length + 1).join(' ') + val
    )

    return indexString
  }

  /**
   * Converts the series contents to a string, where each index and value
   * are equally spaced for ease of reading
   * @return {string} formatted string containing the series content
   */
  string(){
    var indexString = this.indexToString
    var valueString = this.valueToString

    indexString = indexString.concat(['dtype', ' name'])
    valueString = valueString.concat([this.dtype.dtype, this.name])

    const tab_space = 4
    const tab_count = 1

    var string = ''
    for( var i=0; i < indexString.length; i++ ){
      string = string +
        indexString[i] +
        Array(tab_space * tab_count).join(' ') +
        valueString[i] +
        '\r\n'
    }

    return string

  }

  // /**
  //  * Discretizes (bins) the values for a specific column
  //  * based on the users specifications
  //  * @param  {String} col         Column name
  //  * @param  {Object} [params={}] parameters to define the binning
  //  * @return {Object}             jsonArray containing the binning results
  //  */
  // discretize( params={} ){
  //
  //   // placeholder for the bins
  //   var bins = [];
  //
  //   // extract the parameters
  //   const param_keys = Object.keys(params)
  //
  //   const min = this.min
  //
  //   // set defaults when none are provided
  //   if( !param_keys.includes('bins') ) params['bins'] = 10
  //   if( !param_keys.includes('interval') ){
  //     const max = this.max
  //     params['interval'] = (max-min)/params['bins']
  //   }
  //
  //
  //   //Setup Bins
  //   for(var i = 0; i < params['bins']; i++ ){
  //     bins.push({
  //       binNum: i,
  //       value: min + i*params['interval'],
  //       max: min + (i+1)*params['interval'],
  //       count: 0
  //     })
  //   }
  //
  //   //Loop through data and add to bin's count
  //   for (i = 0; i < this.values.length; i++){
  //     var item = this.values[i];
  //
  //     for (var j = 0; j < bins.length; j++){
  //       var bin = bins[j];
  //
  //       // condition logic to account for the first step
  //       // to include the minimum value
  //       var logic = item > bin.value && item <= bin.max
  //       if( j === 0) logic = item >= bin.value && item <= bin.max
  //
  //       if(logic){
  //         bin.count++;
  //         break
  //       }
  //     }
  //   }
  //
  //   return new jsonArray( bins )
  // }

  /**
   * Counts the number of occurences for each unique value
   * @return {Object}             jsonArray containing the binning results
   */
  get count(){

    // placeholder for the results
    var results = {};

    const unique_values = this.unique()

    // setup the results
    for(var i = 0; i < unique_values.length; i++ ){
      const value = unique_values[i]
      results[value] = this.values.filter(item => item === value).length
    }

    return new Series(results)

  }


  /**
   * Returns the number of occurences for each unique value
   * @param  {Boolean} [ordered=false] When True, the unique values are returned in sorted order
   * @return {Array}                   Array of unique values
   */
  unique( ordered=false ){
    // return all unique values for the specified column. When
    // ordered is set to true, these values are sorted.

    var unique_values = [...new Set([...this.values])]

    // When the column is an array type, concatinate all array values
    if( this.dtype === 'array'){
      var temp = []
      for( var i=0; i < unique_values.length; i++ ){
        if(unique_values[i] === undefined) continue
        temp = temp.concat(unique_values[i])
      }

      // overwrite the unique values with the concatinated values
      unique_values = [...new Set(temp)]
    }

    if( ordered === true ) return unique_values.sort()

    return unique_values
  }
  //
  //
  // sort(ascending=false){
  //
  //   var values = this.values
  //
  //   // order string type
  //   if( this.dtype === 'string' ){
  //     return values.sort()
  //   }
  //
  //   try{
  //     values = values.map( x => +x)
  //     values = values.sort(function(a,b){return a - b})
  //   }catch{
  //     // default to the standard sort
  //     values.sort()
  //   }
  //
  //   return values
  // }
  //
  //
  // /********************************************************************************
  // *  Math Functions
  // *  ===============================
  // *  Interface for computing common statistical functions
  // ********************************************************************************/
  // get max(){
  //   if( this.values.length === 1 ) return this.values[0]
  //   return Math.max(...this.values)
  // }
  //
  // get min(){
  //   if( this.values.length === 1 ) return this.values[0]
  //   return Math.min(...this.values)
  // }
  //
  // get sum(){
  //   if( this.values.length === 1 ) return this.values[0]
  //   return this.values.reduce((a,b) => a + b, 0)
  // }
  //
  // get mean(){
  //   if( this.values.length === 1 ) return this[0]
  //   return this.sum / this.values.length
  // }
  //
  //
  //
  // /**
  //  * Applies the function using the variable and the local series
  //  * as inputs. this is intended for arithmetic Functions
  //  * @param  {mixed} variable variable or series
  //  * @param  {function} func     function to apply on the local and variable data
  //  * @return {Series}            Series containing the resuting data
  //  */
  // compute(variable, func){
  //
  //   var data = {...this}
  //
  //   var obj = Number(variable)
  //
  //   // apply the function on the objects sharing the same key
  //   if( isNaN(obj) ){
  //
  //     for (var [key, value] of Object.entries(variable)) {
  //       var val = data[key]
  //       if( val === undefined ) val = 0
  //       data[key] = func( val, value)
  //     }
  //
  //   // perform the function using the object value directly
  //   }else{
  //     for (var [key, value] of Object.entries(data)) {
  //       data[key] = func( value, obj)
  //     }
  //   }
  //
  //   // return the data as a series
  //   return new Series({
  //     object: data,
  //     dtype: this.dtype,
  //     dtypes: this.dtypes,
  //     name: this.name,
  //   })
  // }
  //
  // /**
  //  * Performs addition on the local Series with the variable
  //  * data. The variable can be an integer, string, or another
  //  * series object. When a Series is given, the data is added
  //  * based on the index
  //  * @param  {mixed} variable input data (supports mixed type)
  //  * @return {Series}         Series containing the results
  //  */
  // add( variable ){
  //   return this.compute( variable, (x, y) => {return x + y} )
  // }
  //
  // /**
  //  * Performs subtraction on the local Series with the variable
  //  * data. The variable can be an integer, string, or another
  //  * series object. When a Series is given, the data is added
  //  * based on the index
  //  * @param  {mixed} variable input data (supports mixed type)
  //  * @return {Series}         Series containing the results
  //  */
  // sub( variable ){
  //   return this.compute( variable, (x, y) => {return x - y} )
  // }
  //
  // /**
  //  * Performs multiplication on the local Series with the variable
  //  * data. The variable can be an integer, string, or another
  //  * series object. When a Series is given, the data is added
  //  * based on the index
  //  * @param  {mixed} variable input data (supports mixed type)
  //  * @return {Series}         Series containing the results
  //  */
  // multiply( variable ){
  //   return this.compute( variable, (x, y) => {return x * y} )
  // }
  //
  // /**
  //  * Performs division on the local Series with the variable
  //  * data. The variable can be an integer, string, or another
  //  * series object. When a Series is given, the data is added
  //  * based on the index
  //  * @param  {mixed} variable input data (supports mixed type)
  //  * @return {Series}         Series containing the results
  //  */
  // divide( variable ){
  //   return this.compute( variable, (x, y) => {return x/y} )
  // }
  //
  // get react(){ return new ReactComponents(this) }

}

module.exports = Series;
