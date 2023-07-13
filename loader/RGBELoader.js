const UVMapping = 300;
const RepeatWrapping = 1000;
const ClampToEdgeWrapping = 1001;
const MirroredRepeatWrapping = 1002;
const NearestFilter = 1003;
const LinearFilter = 1006;
const LinearMipmapLinearFilter = 1008;
const UnsignedByteType = 1009;
const FloatType = 1015;
const HalfFloatType = 1016;
const RGBAFormat = 1023;
/** @deprecated Use LinearSRGBColorSpace or NoColorSpace in three.js r152+. */
const LinearEncoding = 3000;
/** @deprecated Use SRGBColorSpace in three.js r152+. */
const sRGBEncoding = 3001;

// Color space string identifiers, matching CSS Color Module Level 4 and WebGPU names where available.
const NoColorSpace = '';
const SRGBColorSpace = 'srgb';
const LinearSRGBColorSpace = 'srgb-linear';

const Cache = {

	enabled: false,

	files: {},

	add: function ( key, file ) {

		if ( this.enabled === false ) return;

		// console.log( 'THREE.Cache', 'Adding key:', key );

		this.files[ key ] = file;

	},

	get: function ( key ) {

		if ( this.enabled === false ) return;

		// console.log( 'THREE.Cache', 'Checking key:', key );

		return this.files[ key ];

	},

	remove: function ( key ) {

		delete this.files[ key ];

	},

	clear: function () {

		this.files = {};

	}

};

class LoadingManager {

	constructor( onLoad, onProgress, onError ) {

		const scope = this;

		let isLoading = false;
		let itemsLoaded = 0;
		let itemsTotal = 0;
		let urlModifier = undefined;
		const handlers = [];

		// Refer to #5689 for the reason why we don't set .onStart
		// in the constructor

		this.onStart = undefined;
		this.onLoad = onLoad;
		this.onProgress = onProgress;
		this.onError = onError;

		this.itemStart = function ( url ) {

			itemsTotal ++;

			if ( isLoading === false ) {

				if ( scope.onStart !== undefined ) {

					scope.onStart( url, itemsLoaded, itemsTotal );

				}

			}

			isLoading = true;

		};

		this.itemEnd = function ( url ) {

			itemsLoaded ++;

			if ( scope.onProgress !== undefined ) {

				scope.onProgress( url, itemsLoaded, itemsTotal );

			}

			if ( itemsLoaded === itemsTotal ) {

				isLoading = false;

				if ( scope.onLoad !== undefined ) {

					scope.onLoad();

				}

			}

		};

		this.itemError = function ( url ) {

			if ( scope.onError !== undefined ) {

				scope.onError( url );

			}

		};

		this.resolveURL = function ( url ) {

			if ( urlModifier ) {

				return urlModifier( url );

			}

			return url;

		};

		this.setURLModifier = function ( transform ) {

			urlModifier = transform;

			return this;

		};

		this.addHandler = function ( regex, loader ) {

			handlers.push( regex, loader );

			return this;

		};

		this.removeHandler = function ( regex ) {

			const index = handlers.indexOf( regex );

			if ( index !== - 1 ) {

				handlers.splice( index, 2 );

			}

			return this;

		};

		this.getHandler = function ( file ) {

			for ( let i = 0, l = handlers.length; i < l; i += 2 ) {

				const regex = handlers[ i ];
				const loader = handlers[ i + 1 ];

				if ( regex.global ) regex.lastIndex = 0; // see #17920

				if ( regex.test( file ) ) {

					return loader;

				}

			}

			return null;

		};

	}

}

const DefaultLoadingManager = /*@__PURE__*/ new LoadingManager();

class Loader {

	constructor( manager ) {

		this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

		this.crossOrigin = 'anonymous';
		this.withCredentials = false;
		this.path = '';
		this.resourcePath = '';
		this.requestHeader = {};

	}

	load( /* url, onLoad, onProgress, onError */ ) {}

	loadAsync( url, onProgress ) {

		const scope = this;

		return new Promise( function ( resolve, reject ) {

			scope.load( url, resolve, onProgress, reject );

		} );

	}

	parse( /* data */ ) {}

	setCrossOrigin( crossOrigin ) {

		this.crossOrigin = crossOrigin;
		return this;

	}

	setWithCredentials( value ) {

		this.withCredentials = value;
		return this;

	}

	setPath( path ) {

		this.path = path;
		return this;

	}

	setResourcePath( resourcePath ) {

		this.resourcePath = resourcePath;
		return this;

	}

	setRequestHeader( requestHeader ) {

		this.requestHeader = requestHeader;
		return this;

	}

}

Loader.DEFAULT_MATERIAL_NAME = '__DEFAULT';

const loading = {};

class HttpError extends Error {

	constructor( message, response ) {

		super( message );
		this.response = response;

	}

}

class FileLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		url = this.manager.resolveURL( url );

		const cached = Cache.get( url );

		if ( cached !== undefined ) {

			this.manager.itemStart( url );

			setTimeout( () => {

				if ( onLoad ) onLoad( cached );

				this.manager.itemEnd( url );

			}, 0 );

			return cached;

		}

		// Check if request is duplicate

		if ( loading[ url ] !== undefined ) {

			loading[ url ].push( {

				onLoad: onLoad,
				onProgress: onProgress,
				onError: onError

			} );

			return;

		}

		// Initialise array for duplicate requests
		loading[ url ] = [];

		loading[ url ].push( {
			onLoad: onLoad,
			onProgress: onProgress,
			onError: onError,
		} );

		// create request
		const req = new Request( url, {
			headers: new Headers( this.requestHeader ),
			credentials: this.withCredentials ? 'include' : 'same-origin',
			// An abort controller could be added within a future PR
		} );

		// record states ( avoid data race )
		const mimeType = this.mimeType;
		const responseType = this.responseType;

		// start the fetch
		fetch( req )
			.then( response => {

				if ( response.status === 200 || response.status === 0 ) {

					// Some browsers return HTTP Status 0 when using non-http protocol
					// e.g. 'file://' or 'data://'. Handle as success.

					if ( response.status === 0 ) {

						console.warn( 'THREE.FileLoader: HTTP Status 0 received.' );

					}

					// Workaround: Checking if response.body === undefined for Alipay browser #23548

					if ( typeof ReadableStream === 'undefined' || response.body === undefined || response.body.getReader === undefined ) {

						return response;

					}

					const callbacks = loading[ url ];
					const reader = response.body.getReader();

					// Nginx needs X-File-Size check
					// https://serverfault.com/questions/482875/why-does-nginx-remove-content-length-header-for-chunked-content
					const contentLength = response.headers.get( 'Content-Length' ) || response.headers.get( 'X-File-Size' );
					const total = contentLength ? parseInt( contentLength ) : 0;
					const lengthComputable = total !== 0;
					let loaded = 0;

					// periodically read data into the new stream tracking while download progress
					const stream = new ReadableStream( {
						start( controller ) {

							readData();

							function readData() {

								reader.read().then( ( { done, value } ) => {

									if ( done ) {

										controller.close();

									} else {

										loaded += value.byteLength;

										const event = new ProgressEvent( 'progress', { lengthComputable, loaded, total } );
										for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

											const callback = callbacks[ i ];
											if ( callback.onProgress ) callback.onProgress( event );

										}

										controller.enqueue( value );
										readData();

									}

								} );

							}

						}

					} );

					return new Response( stream );

				} else {

					throw new HttpError( `fetch for "${response.url}" responded with ${response.status}: ${response.statusText}`, response );

				}

			} )
			.then( response => {

				switch ( responseType ) {

					case 'arraybuffer':

						return response.arrayBuffer();

					case 'blob':

						return response.blob();

					case 'document':

						return response.text()
							.then( text => {

								const parser = new DOMParser();
								return parser.parseFromString( text, mimeType );

							} );

					case 'json':

						return response.json();

					default:

						if ( mimeType === undefined ) {

							return response.text();

						} else {

							// sniff encoding
							const re = /charset="?([^;"\s]*)"?/i;
							const exec = re.exec( mimeType );
							const label = exec && exec[ 1 ] ? exec[ 1 ].toLowerCase() : undefined;
							const decoder = new TextDecoder( label );
							return response.arrayBuffer().then( ab => decoder.decode( ab ) );

						}

				}

			} )
			.then( data => {

				// Add to cache only on HTTP success, so that we do not cache
				// error response bodies as proper responses to requests.
				Cache.add( url, data );

				const callbacks = loading[ url ];
				delete loading[ url ];

				for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

					const callback = callbacks[ i ];
					if ( callback.onLoad ) callback.onLoad( data );

				}

			} )
			.catch( err => {

				// Abort errors and other errors are handled the same

				const callbacks = loading[ url ];

				if ( callbacks === undefined ) {

					// When onLoad was called and url was deleted in `loading`
					this.manager.itemError( url );
					throw err;

				}

				delete loading[ url ];

				for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

					const callback = callbacks[ i ];
					if ( callback.onError ) callback.onError( err );

				}

				this.manager.itemError( url );

			} )
			.finally( () => {

				this.manager.itemEnd( url );

			} );

		this.manager.itemStart( url );

	}

	setResponseType( value ) {

		this.responseType = value;
		return this;

	}

	setMimeType( value ) {

		this.mimeType = value;
		return this;

	}

}

/**
 * https://github.com/mrdoob/eventdispatcher.js/
 */

class EventDispatcher {

	addEventListener( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		const listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	}

	hasEventListener( type, listener ) {

		if ( this._listeners === undefined ) return false;

		const listeners = this._listeners;

		return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;

	}

	removeEventListener( type, listener ) {

		if ( this._listeners === undefined ) return;

		const listeners = this._listeners;
		const listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			const index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	}

	dispatchEvent( event ) {

		if ( this._listeners === undefined ) return;

		const listeners = this._listeners;
		const listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			// Make a copy, in case listeners are removed while iterating.
			const array = listenerArray.slice( 0 );

			for ( let i = 0, l = array.length; i < l; i ++ ) {

				array[ i ].call( this, event );

			}

			event.target = null;

		}

	}

}

const _lut = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff' ];

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
function generateUUID() {

	const d0 = Math.random() * 0xffffffff | 0;
	const d1 = Math.random() * 0xffffffff | 0;
	const d2 = Math.random() * 0xffffffff | 0;
	const d3 = Math.random() * 0xffffffff | 0;
	const uuid = _lut[ d0 & 0xff ] + _lut[ d0 >> 8 & 0xff ] + _lut[ d0 >> 16 & 0xff ] + _lut[ d0 >> 24 & 0xff ] + '-' +
			_lut[ d1 & 0xff ] + _lut[ d1 >> 8 & 0xff ] + '-' + _lut[ d1 >> 16 & 0x0f | 0x40 ] + _lut[ d1 >> 24 & 0xff ] + '-' +
			_lut[ d2 & 0x3f | 0x80 ] + _lut[ d2 >> 8 & 0xff ] + '-' + _lut[ d2 >> 16 & 0xff ] + _lut[ d2 >> 24 & 0xff ] +
			_lut[ d3 & 0xff ] + _lut[ d3 >> 8 & 0xff ] + _lut[ d3 >> 16 & 0xff ] + _lut[ d3 >> 24 & 0xff ];

	// .toLowerCase() here flattens concatenated strings to save heap memory space.
	return uuid.toLowerCase();

}

function clamp( value, min, max ) {

	return Math.max( min, Math.min( max, value ) );

}

class Vector2 {

	constructor( x = 0, y = 0 ) {

		Vector2.prototype.isVector2 = true;

		this.x = x;
		this.y = y;

	}

	get width() {

		return this.x;

	}

	set width( value ) {

		this.x = value;

	}

	get height() {

		return this.y;

	}

	set height( value ) {

		this.y = value;

	}

	set( x, y ) {

		this.x = x;
		this.y = y;

		return this;

	}

	setScalar( scalar ) {

		this.x = scalar;
		this.y = scalar;

		return this;

	}

	setX( x ) {

		this.x = x;

		return this;

	}

	setY( y ) {

		this.y = y;

		return this;

	}

	setComponent( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

		return this;

	}

	getComponent( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			default: throw new Error( 'index is out of range: ' + index );

		}

	}

	clone() {

		return new this.constructor( this.x, this.y );

	}

	copy( v ) {

		this.x = v.x;
		this.y = v.y;

		return this;

	}

	add( v ) {

		this.x += v.x;
		this.y += v.y;

		return this;

	}

	addScalar( s ) {

		this.x += s;
		this.y += s;

		return this;

	}

	addVectors( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;

		return this;

	}

	addScaledVector( v, s ) {

		this.x += v.x * s;
		this.y += v.y * s;

		return this;

	}

	sub( v ) {

		this.x -= v.x;
		this.y -= v.y;

		return this;

	}

	subScalar( s ) {

		this.x -= s;
		this.y -= s;

		return this;

	}

	subVectors( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;

		return this;

	}

	multiply( v ) {

		this.x *= v.x;
		this.y *= v.y;

		return this;

	}

	multiplyScalar( scalar ) {

		this.x *= scalar;
		this.y *= scalar;

		return this;

	}

	divide( v ) {

		this.x /= v.x;
		this.y /= v.y;

		return this;

	}

	divideScalar( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	applyMatrix3( m ) {

		const x = this.x, y = this.y;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ];
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ];

		return this;

	}

	min( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );

		return this;

	}

	max( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );

		return this;

	}

	clamp( min, max ) {

		// assumes min < max, componentwise

		this.x = Math.max( min.x, Math.min( max.x, this.x ) );
		this.y = Math.max( min.y, Math.min( max.y, this.y ) );

		return this;

	}

	clampScalar( minVal, maxVal ) {

		this.x = Math.max( minVal, Math.min( maxVal, this.x ) );
		this.y = Math.max( minVal, Math.min( maxVal, this.y ) );

		return this;

	}

	clampLength( min, max ) {

		const length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar( Math.max( min, Math.min( max, length ) ) );

	}

	floor() {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );

		return this;

	}

	ceil() {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );

		return this;

	}

	round() {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );

		return this;

	}

	roundToZero() {

		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );

		return this;

	}

	negate() {

		this.x = - this.x;
		this.y = - this.y;

		return this;

	}

	dot( v ) {

		return this.x * v.x + this.y * v.y;

	}

	cross( v ) {

		return this.x * v.y - this.y * v.x;

	}

	lengthSq() {

		return this.x * this.x + this.y * this.y;

	}

	length() {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	}

	manhattanLength() {

		return Math.abs( this.x ) + Math.abs( this.y );

	}

	normalize() {

		return this.divideScalar( this.length() || 1 );

	}

	angle() {

		// computes the angle in radians with respect to the positive x-axis

		const angle = Math.atan2( - this.y, - this.x ) + Math.PI;

		return angle;

	}

	angleTo( v ) {

		const denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );

		if ( denominator === 0 ) return Math.PI / 2;

		const theta = this.dot( v ) / denominator;

		// clamp, to handle numerical problems

		return Math.acos( clamp( theta, - 1, 1 ) );

	}

	distanceTo( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

	distanceToSquared( v ) {

		const dx = this.x - v.x, dy = this.y - v.y;
		return dx * dx + dy * dy;

	}

	manhattanDistanceTo( v ) {

		return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y );

	}

	setLength( length ) {

		return this.normalize().multiplyScalar( length );

	}

	lerp( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;

		return this;

	}

	lerpVectors( v1, v2, alpha ) {

		this.x = v1.x + ( v2.x - v1.x ) * alpha;
		this.y = v1.y + ( v2.y - v1.y ) * alpha;

		return this;

	}

	equals( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) );

	}

	fromArray( array, offset = 0 ) {

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;

		return array;

	}

	fromBufferAttribute( attribute, index ) {

		this.x = attribute.getX( index );
		this.y = attribute.getY( index );

		return this;

	}

	rotateAround( center, angle ) {

		const c = Math.cos( angle ), s = Math.sin( angle );

		const x = this.x - center.x;
		const y = this.y - center.y;

		this.x = x * c - y * s + center.x;
		this.y = x * s + y * c + center.y;

		return this;

	}

	random() {

		this.x = Math.random();
		this.y = Math.random();

		return this;

	}

	*[ Symbol.iterator ]() {

		yield this.x;
		yield this.y;

	}

}

class Matrix3 {

	constructor( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

		Matrix3.prototype.isMatrix3 = true;

		this.elements = [

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		];

		if ( n11 !== undefined ) {

			this.set( n11, n12, n13, n21, n22, n23, n31, n32, n33 );

		}

	}

	set( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

		const te = this.elements;

		te[ 0 ] = n11; te[ 1 ] = n21; te[ 2 ] = n31;
		te[ 3 ] = n12; te[ 4 ] = n22; te[ 5 ] = n32;
		te[ 6 ] = n13; te[ 7 ] = n23; te[ 8 ] = n33;

		return this;

	}

	identity() {

		this.set(

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		);

		return this;

	}

	copy( m ) {

		const te = this.elements;
		const me = m.elements;

		te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ];
		te[ 3 ] = me[ 3 ]; te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ];
		te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ]; te[ 8 ] = me[ 8 ];

		return this;

	}

	extractBasis( xAxis, yAxis, zAxis ) {

		xAxis.setFromMatrix3Column( this, 0 );
		yAxis.setFromMatrix3Column( this, 1 );
		zAxis.setFromMatrix3Column( this, 2 );

		return this;

	}

	setFromMatrix4( m ) {

		const me = m.elements;

		this.set(

			me[ 0 ], me[ 4 ], me[ 8 ],
			me[ 1 ], me[ 5 ], me[ 9 ],
			me[ 2 ], me[ 6 ], me[ 10 ]

		);

		return this;

	}

	multiply( m ) {

		return this.multiplyMatrices( this, m );

	}

	premultiply( m ) {

		return this.multiplyMatrices( m, this );

	}

	multiplyMatrices( a, b ) {

		const ae = a.elements;
		const be = b.elements;
		const te = this.elements;

		const a11 = ae[ 0 ], a12 = ae[ 3 ], a13 = ae[ 6 ];
		const a21 = ae[ 1 ], a22 = ae[ 4 ], a23 = ae[ 7 ];
		const a31 = ae[ 2 ], a32 = ae[ 5 ], a33 = ae[ 8 ];

		const b11 = be[ 0 ], b12 = be[ 3 ], b13 = be[ 6 ];
		const b21 = be[ 1 ], b22 = be[ 4 ], b23 = be[ 7 ];
		const b31 = be[ 2 ], b32 = be[ 5 ], b33 = be[ 8 ];

		te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
		te[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
		te[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;

		te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
		te[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
		te[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;

		te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
		te[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
		te[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;

		return this;

	}

	multiplyScalar( s ) {

		const te = this.elements;

		te[ 0 ] *= s; te[ 3 ] *= s; te[ 6 ] *= s;
		te[ 1 ] *= s; te[ 4 ] *= s; te[ 7 ] *= s;
		te[ 2 ] *= s; te[ 5 ] *= s; te[ 8 ] *= s;

		return this;

	}

	determinant() {

		const te = this.elements;

		const a = te[ 0 ], b = te[ 1 ], c = te[ 2 ],
			d = te[ 3 ], e = te[ 4 ], f = te[ 5 ],
			g = te[ 6 ], h = te[ 7 ], i = te[ 8 ];

		return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;

	}

	invert() {

		const te = this.elements,

			n11 = te[ 0 ], n21 = te[ 1 ], n31 = te[ 2 ],
			n12 = te[ 3 ], n22 = te[ 4 ], n32 = te[ 5 ],
			n13 = te[ 6 ], n23 = te[ 7 ], n33 = te[ 8 ],

			t11 = n33 * n22 - n32 * n23,
			t12 = n32 * n13 - n33 * n12,
			t13 = n23 * n12 - n22 * n13,

			det = n11 * t11 + n21 * t12 + n31 * t13;

		if ( det === 0 ) return this.set( 0, 0, 0, 0, 0, 0, 0, 0, 0 );

		const detInv = 1 / det;

		te[ 0 ] = t11 * detInv;
		te[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv;
		te[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv;

		te[ 3 ] = t12 * detInv;
		te[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv;
		te[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv;

		te[ 6 ] = t13 * detInv;
		te[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv;
		te[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv;

		return this;

	}

	transpose() {

		let tmp;
		const m = this.elements;

		tmp = m[ 1 ]; m[ 1 ] = m[ 3 ]; m[ 3 ] = tmp;
		tmp = m[ 2 ]; m[ 2 ] = m[ 6 ]; m[ 6 ] = tmp;
		tmp = m[ 5 ]; m[ 5 ] = m[ 7 ]; m[ 7 ] = tmp;

		return this;

	}

	getNormalMatrix( matrix4 ) {

		return this.setFromMatrix4( matrix4 ).invert().transpose();

	}

	transposeIntoArray( r ) {

		const m = this.elements;

		r[ 0 ] = m[ 0 ];
		r[ 1 ] = m[ 3 ];
		r[ 2 ] = m[ 6 ];
		r[ 3 ] = m[ 1 ];
		r[ 4 ] = m[ 4 ];
		r[ 5 ] = m[ 7 ];
		r[ 6 ] = m[ 2 ];
		r[ 7 ] = m[ 5 ];
		r[ 8 ] = m[ 8 ];

		return this;

	}

	setUvTransform( tx, ty, sx, sy, rotation, cx, cy ) {

		const c = Math.cos( rotation );
		const s = Math.sin( rotation );

		this.set(
			sx * c, sx * s, - sx * ( c * cx + s * cy ) + cx + tx,
			- sy * s, sy * c, - sy * ( - s * cx + c * cy ) + cy + ty,
			0, 0, 1
		);

		return this;

	}

	//

	scale( sx, sy ) {

		this.premultiply( _m3.makeScale( sx, sy ) );

		return this;

	}

	rotate( theta ) {

		this.premultiply( _m3.makeRotation( - theta ) );

		return this;

	}

	translate( tx, ty ) {

		this.premultiply( _m3.makeTranslation( tx, ty ) );

		return this;

	}

	// for 2D Transforms

	makeTranslation( x, y ) {

		if ( x.isVector2 ) {

			this.set(

				1, 0, x.x,
				0, 1, x.y,
				0, 0, 1

			);

		} else {

			this.set(

				1, 0, x,
				0, 1, y,
				0, 0, 1

			);

		}

		return this;

	}

	makeRotation( theta ) {

		// counterclockwise

		const c = Math.cos( theta );
		const s = Math.sin( theta );

		this.set(

			c, - s, 0,
			s, c, 0,
			0, 0, 1

		);

		return this;

	}

	makeScale( x, y ) {

		this.set(

			x, 0, 0,
			0, y, 0,
			0, 0, 1

		);

		return this;

	}

	//

	equals( matrix ) {

		const te = this.elements;
		const me = matrix.elements;

		for ( let i = 0; i < 9; i ++ ) {

			if ( te[ i ] !== me[ i ] ) return false;

		}

		return true;

	}

	fromArray( array, offset = 0 ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.elements[ i ] = array[ i + offset ];

		}

		return this;

	}

	toArray( array = [], offset = 0 ) {

		const te = this.elements;

		array[ offset ] = te[ 0 ];
		array[ offset + 1 ] = te[ 1 ];
		array[ offset + 2 ] = te[ 2 ];

		array[ offset + 3 ] = te[ 3 ];
		array[ offset + 4 ] = te[ 4 ];
		array[ offset + 5 ] = te[ 5 ];

		array[ offset + 6 ] = te[ 6 ];
		array[ offset + 7 ] = te[ 7 ];
		array[ offset + 8 ] = te[ 8 ];

		return array;

	}

	clone() {

		return new this.constructor().fromArray( this.elements );

	}

}

const _m3 = /*@__PURE__*/ new Matrix3();

function createElementNS( name ) {

	return document.createElementNS( 'http://www.w3.org/1999/xhtml', name );

}

const _cache = {};

function warnOnce( message ) {

	if ( message in _cache ) return;

	_cache[ message ] = true;

	console.warn( message );

}

function SRGBToLinear( c ) {

	return ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );

}

let _canvas;

class ImageUtils {

	static getDataURL( image ) {

		if ( /^data:/i.test( image.src ) ) {

			return image.src;

		}

		if ( typeof HTMLCanvasElement === 'undefined' ) {

			return image.src;

		}

		let canvas;

		if ( image instanceof HTMLCanvasElement ) {

			canvas = image;

		} else {

			if ( _canvas === undefined ) _canvas = createElementNS( 'canvas' );

			_canvas.width = image.width;
			_canvas.height = image.height;

			const context = _canvas.getContext( '2d' );

			if ( image instanceof ImageData ) {

				context.putImageData( image, 0, 0 );

			} else {

				context.drawImage( image, 0, 0, image.width, image.height );

			}

			canvas = _canvas;

		}

		if ( canvas.width > 2048 || canvas.height > 2048 ) {

			console.warn( 'THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons', image );

			return canvas.toDataURL( 'image/jpeg', 0.6 );

		} else {

			return canvas.toDataURL( 'image/png' );

		}

	}

	static sRGBToLinear( image ) {

		if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
			( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
			( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap ) ) {

			const canvas = createElementNS( 'canvas' );

			canvas.width = image.width;
			canvas.height = image.height;

			const context = canvas.getContext( '2d' );
			context.drawImage( image, 0, 0, image.width, image.height );

			const imageData = context.getImageData( 0, 0, image.width, image.height );
			const data = imageData.data;

			for ( let i = 0; i < data.length; i ++ ) {

				data[ i ] = SRGBToLinear( data[ i ] / 255 ) * 255;

			}

			context.putImageData( imageData, 0, 0 );

			return canvas;

		} else if ( image.data ) {

			const data = image.data.slice( 0 );

			for ( let i = 0; i < data.length; i ++ ) {

				if ( data instanceof Uint8Array || data instanceof Uint8ClampedArray ) {

					data[ i ] = Math.floor( SRGBToLinear( data[ i ] / 255 ) * 255 );

				} else {

					// assuming float

					data[ i ] = SRGBToLinear( data[ i ] );

				}

			}

			return {
				data: data,
				width: image.width,
				height: image.height
			};

		} else {

			console.warn( 'THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.' );
			return image;

		}

	}

}

let sourceId = 0;

class Source {

	constructor( data = null ) {

		this.isSource = true;

		Object.defineProperty( this, 'id', { value: sourceId ++ } );

		this.uuid = generateUUID();

		this.data = data;

		this.version = 0;

	}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	toJSON( meta ) {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( ! isRootObject && meta.images[ this.uuid ] !== undefined ) {

			return meta.images[ this.uuid ];

		}

		const output = {
			uuid: this.uuid,
			url: ''
		};

		const data = this.data;

		if ( data !== null ) {

			let url;

			if ( Array.isArray( data ) ) {

				// cube texture

				url = [];

				for ( let i = 0, l = data.length; i < l; i ++ ) {

					if ( data[ i ].isDataTexture ) {

						url.push( serializeImage( data[ i ].image ) );

					} else {

						url.push( serializeImage( data[ i ] ) );

					}

				}

			} else {

				// texture

				url = serializeImage( data );

			}

			output.url = url;

		}

		if ( ! isRootObject ) {

			meta.images[ this.uuid ] = output;

		}

		return output;

	}

}

function serializeImage( image ) {

	if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
		( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
		( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap ) ) {

		// default images

		return ImageUtils.getDataURL( image );

	} else {

		if ( image.data ) {

			// images of DataTexture

			return {
				data: Array.from( image.data ),
				width: image.width,
				height: image.height,
				type: image.data.constructor.name
			};

		} else {

			console.warn( 'THREE.Texture: Unable to serialize Texture.' );
			return {};

		}

	}

}

let textureId = 0;

class Texture extends EventDispatcher {

	constructor( image = Texture.DEFAULT_IMAGE, mapping = Texture.DEFAULT_MAPPING, wrapS = ClampToEdgeWrapping, wrapT = ClampToEdgeWrapping, magFilter = LinearFilter, minFilter = LinearMipmapLinearFilter, format = RGBAFormat, type = UnsignedByteType, anisotropy = Texture.DEFAULT_ANISOTROPY, colorSpace = NoColorSpace ) {

		super();

		this.isTexture = true;

		Object.defineProperty( this, 'id', { value: textureId ++ } );

		this.uuid = generateUUID();

		this.name = '';

		this.source = new Source( image );
		this.mipmaps = [];

		this.mapping = mapping;
		this.channel = 0;

		this.wrapS = wrapS;
		this.wrapT = wrapT;

		this.magFilter = magFilter;
		this.minFilter = minFilter;

		this.anisotropy = anisotropy;

		this.format = format;
		this.internalFormat = null;
		this.type = type;

		this.offset = new Vector2( 0, 0 );
		this.repeat = new Vector2( 1, 1 );
		this.center = new Vector2( 0, 0 );
		this.rotation = 0;

		this.matrixAutoUpdate = true;
		this.matrix = new Matrix3();

		this.generateMipmaps = true;
		this.premultiplyAlpha = false;
		this.flipY = true;
		this.unpackAlignment = 4;	// valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)

		if ( typeof colorSpace === 'string' ) {

			this.colorSpace = colorSpace;

		} else { // @deprecated, r152

			warnOnce( 'THREE.Texture: Property .encoding has been replaced by .colorSpace.' );
			this.colorSpace = colorSpace === sRGBEncoding ? SRGBColorSpace : NoColorSpace;

		}


		this.userData = {};

		this.version = 0;
		this.onUpdate = null;

		this.isRenderTargetTexture = false; // indicates whether a texture belongs to a render target or not
		this.needsPMREMUpdate = false; // indicates whether this texture should be processed by PMREMGenerator or not (only relevant for render target textures)

	}

	get image() {

		return this.source.data;

	}

	set image( value = null ) {

		this.source.data = value;

	}

	updateMatrix() {

		this.matrix.setUvTransform( this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y );

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( source ) {

		this.name = source.name;

		this.source = source.source;
		this.mipmaps = source.mipmaps.slice( 0 );

		this.mapping = source.mapping;
		this.channel = source.channel;

		this.wrapS = source.wrapS;
		this.wrapT = source.wrapT;

		this.magFilter = source.magFilter;
		this.minFilter = source.minFilter;

		this.anisotropy = source.anisotropy;

		this.format = source.format;
		this.internalFormat = source.internalFormat;
		this.type = source.type;

		this.offset.copy( source.offset );
		this.repeat.copy( source.repeat );
		this.center.copy( source.center );
		this.rotation = source.rotation;

		this.matrixAutoUpdate = source.matrixAutoUpdate;
		this.matrix.copy( source.matrix );

		this.generateMipmaps = source.generateMipmaps;
		this.premultiplyAlpha = source.premultiplyAlpha;
		this.flipY = source.flipY;
		this.unpackAlignment = source.unpackAlignment;
		this.colorSpace = source.colorSpace;

		this.userData = JSON.parse( JSON.stringify( source.userData ) );

		this.needsUpdate = true;

		return this;

	}

	toJSON( meta ) {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( ! isRootObject && meta.textures[ this.uuid ] !== undefined ) {

			return meta.textures[ this.uuid ];

		}

		const output = {

			metadata: {
				version: 4.6,
				type: 'Texture',
				generator: 'Texture.toJSON'
			},

			uuid: this.uuid,
			name: this.name,

			image: this.source.toJSON( meta ).uuid,

			mapping: this.mapping,
			channel: this.channel,

			repeat: [ this.repeat.x, this.repeat.y ],
			offset: [ this.offset.x, this.offset.y ],
			center: [ this.center.x, this.center.y ],
			rotation: this.rotation,

			wrap: [ this.wrapS, this.wrapT ],

			format: this.format,
			internalFormat: this.internalFormat,
			type: this.type,
			colorSpace: this.colorSpace,

			minFilter: this.minFilter,
			magFilter: this.magFilter,
			anisotropy: this.anisotropy,

			flipY: this.flipY,

			generateMipmaps: this.generateMipmaps,
			premultiplyAlpha: this.premultiplyAlpha,
			unpackAlignment: this.unpackAlignment

		};

		if ( Object.keys( this.userData ).length > 0 ) output.userData = this.userData;

		if ( ! isRootObject ) {

			meta.textures[ this.uuid ] = output;

		}

		return output;

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

	transformUv( uv ) {

		if ( this.mapping !== UVMapping ) return uv;

		uv.applyMatrix3( this.matrix );

		if ( uv.x < 0 || uv.x > 1 ) {

			switch ( this.wrapS ) {

				case RepeatWrapping:

					uv.x = uv.x - Math.floor( uv.x );
					break;

				case ClampToEdgeWrapping:

					uv.x = uv.x < 0 ? 0 : 1;
					break;

				case MirroredRepeatWrapping:

					if ( Math.abs( Math.floor( uv.x ) % 2 ) === 1 ) {

						uv.x = Math.ceil( uv.x ) - uv.x;

					} else {

						uv.x = uv.x - Math.floor( uv.x );

					}

					break;

			}

		}

		if ( uv.y < 0 || uv.y > 1 ) {

			switch ( this.wrapT ) {

				case RepeatWrapping:

					uv.y = uv.y - Math.floor( uv.y );
					break;

				case ClampToEdgeWrapping:

					uv.y = uv.y < 0 ? 0 : 1;
					break;

				case MirroredRepeatWrapping:

					if ( Math.abs( Math.floor( uv.y ) % 2 ) === 1 ) {

						uv.y = Math.ceil( uv.y ) - uv.y;

					} else {

						uv.y = uv.y - Math.floor( uv.y );

					}

					break;

			}

		}

		if ( this.flipY ) {

			uv.y = 1 - uv.y;

		}

		return uv;

	}

	set needsUpdate( value ) {

		if ( value === true ) {

			this.version ++;
			this.source.needsUpdate = true;

		}

	}

	get encoding() { // @deprecated, r152

		warnOnce( 'THREE.Texture: Property .encoding has been replaced by .colorSpace.' );
		return this.colorSpace === SRGBColorSpace ? sRGBEncoding : LinearEncoding;

	}

	set encoding( encoding ) { // @deprecated, r152

		warnOnce( 'THREE.Texture: Property .encoding has been replaced by .colorSpace.' );
		this.colorSpace = encoding === sRGBEncoding ? SRGBColorSpace : NoColorSpace;

	}

}

Texture.DEFAULT_IMAGE = null;
Texture.DEFAULT_MAPPING = UVMapping;
Texture.DEFAULT_ANISOTROPY = 1;

class DataTexture extends Texture {

	constructor( data = null, width = 1, height = 1, format, type, mapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, colorSpace ) {

		super( null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace );

		this.isDataTexture = true;

		this.image = { data: data, width: width, height: height };

		this.generateMipmaps = false;
		this.flipY = false;
		this.unpackAlignment = 1;

	}

}

/**
 * Abstract Base class to load generic binary textures formats (rgbe, hdr, ...)
 *
 * Sub classes have to implement the parse() method which will be used in load().
 */

class DataTextureLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const texture = new DataTexture();

		const loader = new FileLoader( this.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setPath( this.path );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( buffer ) {

			const texData = scope.parse( buffer );

			if ( ! texData ) return;

			if ( texData.image !== undefined ) {

				texture.image = texData.image;

			} else if ( texData.data !== undefined ) {

				texture.image.width = texData.width;
				texture.image.height = texData.height;
				texture.image.data = texData.data;

			}

			texture.wrapS = texData.wrapS !== undefined ? texData.wrapS : ClampToEdgeWrapping;
			texture.wrapT = texData.wrapT !== undefined ? texData.wrapT : ClampToEdgeWrapping;

			texture.magFilter = texData.magFilter !== undefined ? texData.magFilter : LinearFilter;
			texture.minFilter = texData.minFilter !== undefined ? texData.minFilter : LinearFilter;

			texture.anisotropy = texData.anisotropy !== undefined ? texData.anisotropy : 1;

			if ( texData.colorSpace !== undefined ) {

				texture.colorSpace = texData.colorSpace;

			} else if ( texData.encoding !== undefined ) { // @deprecated, r152

				texture.encoding = texData.encoding;

			}

			if ( texData.flipY !== undefined ) {

				texture.flipY = texData.flipY;

			}

			if ( texData.format !== undefined ) {

				texture.format = texData.format;

			}

			if ( texData.type !== undefined ) {

				texture.type = texData.type;

			}

			if ( texData.mipmaps !== undefined ) {

				texture.mipmaps = texData.mipmaps;
				texture.minFilter = LinearMipmapLinearFilter; // presumably...

			}

			if ( texData.mipmapCount === 1 ) {

				texture.minFilter = LinearFilter;

			}

			if ( texData.generateMipmaps !== undefined ) {

				texture.generateMipmaps = texData.generateMipmaps;

			}

			texture.needsUpdate = true;

			if ( onLoad ) onLoad( texture, texData );

		}, onProgress, onError );


		return texture;

	}

}

// Fast Half Float Conversions, http://www.fox-toolkit.org/ftp/fasthalffloatconversion.pdf

const _tables = /*@__PURE__*/ _generateTables();

function _generateTables() {

	// float32 to float16 helpers

	const buffer = new ArrayBuffer( 4 );
	const floatView = new Float32Array( buffer );
	const uint32View = new Uint32Array( buffer );

	const baseTable = new Uint32Array( 512 );
	const shiftTable = new Uint32Array( 512 );

	for ( let i = 0; i < 256; ++ i ) {

		const e = i - 127;

		// very small number (0, -0)

		if ( e < - 27 ) {

			baseTable[ i ] = 0x0000;
			baseTable[ i | 0x100 ] = 0x8000;
			shiftTable[ i ] = 24;
			shiftTable[ i | 0x100 ] = 24;

			// small number (denorm)

		} else if ( e < - 14 ) {

			baseTable[ i ] = 0x0400 >> ( - e - 14 );
			baseTable[ i | 0x100 ] = ( 0x0400 >> ( - e - 14 ) ) | 0x8000;
			shiftTable[ i ] = - e - 1;
			shiftTable[ i | 0x100 ] = - e - 1;

			// normal number

		} else if ( e <= 15 ) {

			baseTable[ i ] = ( e + 15 ) << 10;
			baseTable[ i | 0x100 ] = ( ( e + 15 ) << 10 ) | 0x8000;
			shiftTable[ i ] = 13;
			shiftTable[ i | 0x100 ] = 13;

			// large number (Infinity, -Infinity)

		} else if ( e < 128 ) {

			baseTable[ i ] = 0x7c00;
			baseTable[ i | 0x100 ] = 0xfc00;
			shiftTable[ i ] = 24;
			shiftTable[ i | 0x100 ] = 24;

			// stay (NaN, Infinity, -Infinity)

		} else {

			baseTable[ i ] = 0x7c00;
			baseTable[ i | 0x100 ] = 0xfc00;
			shiftTable[ i ] = 13;
			shiftTable[ i | 0x100 ] = 13;

		}

	}

	// float16 to float32 helpers

	const mantissaTable = new Uint32Array( 2048 );
	const exponentTable = new Uint32Array( 64 );
	const offsetTable = new Uint32Array( 64 );

	for ( let i = 1; i < 1024; ++ i ) {

		let m = i << 13; // zero pad mantissa bits
		let e = 0; // zero exponent

		// normalized
		while ( ( m & 0x00800000 ) === 0 ) {

			m <<= 1;
			e -= 0x00800000; // decrement exponent

		}

		m &= ~ 0x00800000; // clear leading 1 bit
		e += 0x38800000; // adjust bias

		mantissaTable[ i ] = m | e;

	}

	for ( let i = 1024; i < 2048; ++ i ) {

		mantissaTable[ i ] = 0x38000000 + ( ( i - 1024 ) << 13 );

	}

	for ( let i = 1; i < 31; ++ i ) {

		exponentTable[ i ] = i << 23;

	}

	exponentTable[ 31 ] = 0x47800000;
	exponentTable[ 32 ] = 0x80000000;

	for ( let i = 33; i < 63; ++ i ) {

		exponentTable[ i ] = 0x80000000 + ( ( i - 32 ) << 23 );

	}

	exponentTable[ 63 ] = 0xc7800000;

	for ( let i = 1; i < 64; ++ i ) {

		if ( i !== 32 ) {

			offsetTable[ i ] = 1024;

		}

	}

	return {
		floatView: floatView,
		uint32View: uint32View,
		baseTable: baseTable,
		shiftTable: shiftTable,
		mantissaTable: mantissaTable,
		exponentTable: exponentTable,
		offsetTable: offsetTable
	};

}

// float32 to float16

function toHalfFloat( val ) {

	if ( Math.abs( val ) > 65504 ) console.warn( 'THREE.DataUtils.toHalfFloat(): Value out of range.' );

	val = clamp( val, - 65504, 65504 );

	_tables.floatView[ 0 ] = val;
	const f = _tables.uint32View[ 0 ];
	const e = ( f >> 23 ) & 0x1ff;
	return _tables.baseTable[ e ] + ( ( f & 0x007fffff ) >> _tables.shiftTable[ e ] );

}

// float16 to float32

function fromHalfFloat( val ) {

	const m = val >> 10;
	_tables.uint32View[ 0 ] = _tables.mantissaTable[ _tables.offsetTable[ m ] + ( val & 0x3ff ) ] + _tables.exponentTable[ m ];
	return _tables.floatView[ 0 ];

}

const DataUtils = {
	toHalfFloat: toHalfFloat,
	fromHalfFloat: fromHalfFloat,
};

// https://github.com/mrdoob/three.js/issues/5552
// http://en.wikipedia.org/wiki/RGBE_image_format

class RGBELoader extends DataTextureLoader {

	constructor( manager ) {

		super( manager );

		this.type = HalfFloatType;

	}

	// adapted from http://www.graphics.cornell.edu/~bjw/rgbe.html

	parse( buffer ) {

		const
			/* return codes for rgbe routines */
			//RGBE_RETURN_SUCCESS = 0,
			RGBE_RETURN_FAILURE = - 1,

			/* default error routine.  change this to change error handling */
			rgbe_read_error = 1,
			rgbe_write_error = 2,
			rgbe_format_error = 3,
			rgbe_memory_error = 4,
			rgbe_error = function ( rgbe_error_code, msg ) {

				switch ( rgbe_error_code ) {

					case rgbe_read_error: console.error( 'THREE.RGBELoader Read Error: ' + ( msg || '' ) );
						break;
					case rgbe_write_error: console.error( 'THREE.RGBELoader Write Error: ' + ( msg || '' ) );
						break;
					case rgbe_format_error: console.error( 'THREE.RGBELoader Bad File Format: ' + ( msg || '' ) );
						break;
					default:
					case rgbe_memory_error: console.error( 'THREE.RGBELoader: Error: ' + ( msg || '' ) );

				}

				return RGBE_RETURN_FAILURE;

			},

			/* offsets to red, green, and blue components in a data (float) pixel */
			//RGBE_DATA_RED = 0,
			//RGBE_DATA_GREEN = 1,
			//RGBE_DATA_BLUE = 2,

			/* number of floats per pixel, use 4 since stored in rgba image format */
			//RGBE_DATA_SIZE = 4,

			/* flags indicating which fields in an rgbe_header_info are valid */
			RGBE_VALID_PROGRAMTYPE = 1,
			RGBE_VALID_FORMAT = 2,
			RGBE_VALID_DIMENSIONS = 4,

			NEWLINE = '\n',

			fgets = function ( buffer, lineLimit, consume ) {

				const chunkSize = 128;

				lineLimit = ! lineLimit ? 1024 : lineLimit;
				let p = buffer.pos,
					i = - 1, len = 0, s = '',
					chunk = String.fromCharCode.apply( null, new Uint16Array( buffer.subarray( p, p + chunkSize ) ) );

				while ( ( 0 > ( i = chunk.indexOf( NEWLINE ) ) ) && ( len < lineLimit ) && ( p < buffer.byteLength ) ) {

					s += chunk; len += chunk.length;
					p += chunkSize;
					chunk += String.fromCharCode.apply( null, new Uint16Array( buffer.subarray( p, p + chunkSize ) ) );

				}

				if ( - 1 < i ) {

					/*for (i=l-1; i>=0; i--) {
						byteCode = m.charCodeAt(i);
						if (byteCode > 0x7f && byteCode <= 0x7ff) byteLen++;
						else if (byteCode > 0x7ff && byteCode <= 0xffff) byteLen += 2;
						if (byteCode >= 0xDC00 && byteCode <= 0xDFFF) i--; //trail surrogate
					}*/
					if ( false !== consume ) buffer.pos += len + i + 1;
					return s + chunk.slice( 0, i );

				}

				return false;

			},

			/* minimal header reading.  modify if you want to parse more information */
			RGBE_ReadHeader = function ( buffer ) {


				// regexes to parse header info fields
				const magic_token_re = /^#\?(\S+)/,
					gamma_re = /^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,
					exposure_re = /^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,
					format_re = /^\s*FORMAT=(\S+)\s*$/,
					dimensions_re = /^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,

					// RGBE format header struct
					header = {

						valid: 0, /* indicate which fields are valid */

						string: '', /* the actual header string */

						comments: '', /* comments found in header */

						programtype: 'RGBE', /* listed at beginning of file to identify it after "#?". defaults to "RGBE" */

						format: '', /* RGBE format, default 32-bit_rle_rgbe */

						gamma: 1.0, /* image has already been gamma corrected with given gamma. defaults to 1.0 (no correction) */

						exposure: 1.0, /* a value of 1.0 in an image corresponds to <exposure> watts/steradian/m^2. defaults to 1.0 */

						width: 0, height: 0 /* image dimensions, width/height */

					};

				let line, match;

				if ( buffer.pos >= buffer.byteLength || ! ( line = fgets( buffer ) ) ) {

					return rgbe_error( rgbe_read_error, 'no header found' );

				}

				/* if you want to require the magic token then uncomment the next line */
				if ( ! ( match = line.match( magic_token_re ) ) ) {

					return rgbe_error( rgbe_format_error, 'bad initial token' );

				}

				header.valid |= RGBE_VALID_PROGRAMTYPE;
				header.programtype = match[ 1 ];
				header.string += line + '\n';

				while ( true ) {

					line = fgets( buffer );
					if ( false === line ) break;
					header.string += line + '\n';

					if ( '#' === line.charAt( 0 ) ) {

						header.comments += line + '\n';
						continue; // comment line

					}

					if ( match = line.match( gamma_re ) ) {

						header.gamma = parseFloat( match[ 1 ] );

					}

					if ( match = line.match( exposure_re ) ) {

						header.exposure = parseFloat( match[ 1 ] );

					}

					if ( match = line.match( format_re ) ) {

						header.valid |= RGBE_VALID_FORMAT;
						header.format = match[ 1 ];//'32-bit_rle_rgbe';

					}

					if ( match = line.match( dimensions_re ) ) {

						header.valid |= RGBE_VALID_DIMENSIONS;
						header.height = parseInt( match[ 1 ], 10 );
						header.width = parseInt( match[ 2 ], 10 );

					}

					if ( ( header.valid & RGBE_VALID_FORMAT ) && ( header.valid & RGBE_VALID_DIMENSIONS ) ) break;

				}

				if ( ! ( header.valid & RGBE_VALID_FORMAT ) ) {

					return rgbe_error( rgbe_format_error, 'missing format specifier' );

				}

				if ( ! ( header.valid & RGBE_VALID_DIMENSIONS ) ) {

					return rgbe_error( rgbe_format_error, 'missing image size specifier' );

				}

				return header;

			},

			RGBE_ReadPixels_RLE = function ( buffer, w, h ) {

				const scanline_width = w;

				if (
					// run length encoding is not allowed so read flat
					( ( scanline_width < 8 ) || ( scanline_width > 0x7fff ) ) ||
					// this file is not run length encoded
					( ( 2 !== buffer[ 0 ] ) || ( 2 !== buffer[ 1 ] ) || ( buffer[ 2 ] & 0x80 ) )
				) {

					// return the flat buffer
					return new Uint8Array( buffer );

				}

				if ( scanline_width !== ( ( buffer[ 2 ] << 8 ) | buffer[ 3 ] ) ) {

					return rgbe_error( rgbe_format_error, 'wrong scanline width' );

				}

				const data_rgba = new Uint8Array( 4 * w * h );

				if ( ! data_rgba.length ) {

					return rgbe_error( rgbe_memory_error, 'unable to allocate buffer space' );

				}

				let offset = 0, pos = 0;

				const ptr_end = 4 * scanline_width;
				const rgbeStart = new Uint8Array( 4 );
				const scanline_buffer = new Uint8Array( ptr_end );
				let num_scanlines = h;

				// read in each successive scanline
				while ( ( num_scanlines > 0 ) && ( pos < buffer.byteLength ) ) {

					if ( pos + 4 > buffer.byteLength ) {

						return rgbe_error( rgbe_read_error );

					}

					rgbeStart[ 0 ] = buffer[ pos ++ ];
					rgbeStart[ 1 ] = buffer[ pos ++ ];
					rgbeStart[ 2 ] = buffer[ pos ++ ];
					rgbeStart[ 3 ] = buffer[ pos ++ ];

					if ( ( 2 != rgbeStart[ 0 ] ) || ( 2 != rgbeStart[ 1 ] ) || ( ( ( rgbeStart[ 2 ] << 8 ) | rgbeStart[ 3 ] ) != scanline_width ) ) {

						return rgbe_error( rgbe_format_error, 'bad rgbe scanline format' );

					}

					// read each of the four channels for the scanline into the buffer
					// first red, then green, then blue, then exponent
					let ptr = 0, count;

					while ( ( ptr < ptr_end ) && ( pos < buffer.byteLength ) ) {

						count = buffer[ pos ++ ];
						const isEncodedRun = count > 128;
						if ( isEncodedRun ) count -= 128;

						if ( ( 0 === count ) || ( ptr + count > ptr_end ) ) {

							return rgbe_error( rgbe_format_error, 'bad scanline data' );

						}

						if ( isEncodedRun ) {

							// a (encoded) run of the same value
							const byteValue = buffer[ pos ++ ];
							for ( let i = 0; i < count; i ++ ) {

								scanline_buffer[ ptr ++ ] = byteValue;

							}
							//ptr += count;

						} else {

							// a literal-run
							scanline_buffer.set( buffer.subarray( pos, pos + count ), ptr );
							ptr += count; pos += count;

						}

					}


					// now convert data from buffer into rgba
					// first red, then green, then blue, then exponent (alpha)
					const l = scanline_width; //scanline_buffer.byteLength;
					for ( let i = 0; i < l; i ++ ) {

						let off = 0;
						data_rgba[ offset ] = scanline_buffer[ i + off ];
						off += scanline_width; //1;
						data_rgba[ offset + 1 ] = scanline_buffer[ i + off ];
						off += scanline_width; //1;
						data_rgba[ offset + 2 ] = scanline_buffer[ i + off ];
						off += scanline_width; //1;
						data_rgba[ offset + 3 ] = scanline_buffer[ i + off ];
						offset += 4;

					}

					num_scanlines --;

				}

				return data_rgba;

			};

		const RGBEByteToRGBFloat = function ( sourceArray, sourceOffset, destArray, destOffset ) {

			const e = sourceArray[ sourceOffset + 3 ];
			const scale = Math.pow( 2.0, e - 128.0 ) / 255.0;

			destArray[ destOffset + 0 ] = sourceArray[ sourceOffset + 0 ] * scale;
			destArray[ destOffset + 1 ] = sourceArray[ sourceOffset + 1 ] * scale;
			destArray[ destOffset + 2 ] = sourceArray[ sourceOffset + 2 ] * scale;
			destArray[ destOffset + 3 ] = 1;

		};

		const RGBEByteToRGBHalf = function ( sourceArray, sourceOffset, destArray, destOffset ) {

			const e = sourceArray[ sourceOffset + 3 ];
			const scale = Math.pow( 2.0, e - 128.0 ) / 255.0;

			// clamping to 65504, the maximum representable value in float16
			destArray[ destOffset + 0 ] = DataUtils.toHalfFloat( Math.min( sourceArray[ sourceOffset + 0 ] * scale, 65504 ) );
			destArray[ destOffset + 1 ] = DataUtils.toHalfFloat( Math.min( sourceArray[ sourceOffset + 1 ] * scale, 65504 ) );
			destArray[ destOffset + 2 ] = DataUtils.toHalfFloat( Math.min( sourceArray[ sourceOffset + 2 ] * scale, 65504 ) );
			destArray[ destOffset + 3 ] = DataUtils.toHalfFloat( 1 );

		};

		const byteArray = new Uint8Array( buffer );
		byteArray.pos = 0;
		const rgbe_header_info = RGBE_ReadHeader( byteArray );

		if ( RGBE_RETURN_FAILURE !== rgbe_header_info ) {

			const w = rgbe_header_info.width,
				h = rgbe_header_info.height,
				image_rgba_data = RGBE_ReadPixels_RLE( byteArray.subarray( byteArray.pos ), w, h );

			if ( RGBE_RETURN_FAILURE !== image_rgba_data ) {

				let data, type;
				let numElements;

				switch ( this.type ) {

					case FloatType:

						numElements = image_rgba_data.length / 4;
						const floatArray = new Float32Array( numElements * 4 );

						for ( let j = 0; j < numElements; j ++ ) {

							RGBEByteToRGBFloat( image_rgba_data, j * 4, floatArray, j * 4 );

						}

						data = floatArray;
						type = FloatType;
						break;

					case HalfFloatType:

						numElements = image_rgba_data.length / 4;
						const halfArray = new Uint16Array( numElements * 4 );

						for ( let j = 0; j < numElements; j ++ ) {

							RGBEByteToRGBHalf( image_rgba_data, j * 4, halfArray, j * 4 );

						}

						data = halfArray;
						type = HalfFloatType;
						break;

					default:

						console.error( 'THREE.RGBELoader: unsupported type: ', this.type );
						break;

				}

				return {
					width: w, height: h,
					data: data,
					header: rgbe_header_info.string,
					gamma: rgbe_header_info.gamma,
					exposure: rgbe_header_info.exposure,
					type: type
				};

			}

		}

		return null;

	}

	setDataType( value ) {

		this.type = value;
		return this;

	}

	load( url, onLoad, onProgress, onError ) {

		function onLoadCallback( texture, texData ) {

			switch ( texture.type ) {

				case FloatType:
				case HalfFloatType:

					texture.colorSpace = LinearSRGBColorSpace;
					texture.minFilter = LinearFilter;
					texture.magFilter = LinearFilter;
					texture.generateMipmaps = false;
					texture.flipY = true;

					break;

			}

			if ( onLoad ) onLoad( texture, texData );

		}

		return super.load( url, onLoadCallback, onProgress, onError );

	}

}

export { RGBELoader };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUkdCRUxvYWRlci5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0YW50cy5qcyIsIi4uL3NyYy9sb2FkZXJzL0NhY2hlLmpzIiwiLi4vc3JjL2xvYWRlcnMvTG9hZGluZ01hbmFnZXIuanMiLCIuLi9zcmMvbG9hZGVycy9Mb2FkZXIuanMiLCIuLi9zcmMvbG9hZGVycy9GaWxlTG9hZGVyLmpzIiwiLi4vc3JjL2NvcmUvRXZlbnREaXNwYXRjaGVyLmpzIiwiLi4vc3JjL21hdGgvTWF0aFV0aWxzLmpzIiwiLi4vc3JjL21hdGgvVmVjdG9yMi5qcyIsIi4uL3NyYy9tYXRoL01hdHJpeDMuanMiLCIuLi9zcmMvdXRpbHMuanMiLCIuLi9zcmMvbWF0aC9Db2xvck1hbmFnZW1lbnQuanMiLCIuLi9zcmMvZXh0cmFzL0ltYWdlVXRpbHMuanMiLCIuLi9zcmMvdGV4dHVyZXMvU291cmNlLmpzIiwiLi4vc3JjL3RleHR1cmVzL1RleHR1cmUuanMiLCIuLi9zcmMvdGV4dHVyZXMvRGF0YVRleHR1cmUuanMiLCIuLi9zcmMvbG9hZGVycy9EYXRhVGV4dHVyZUxvYWRlci5qcyIsIi4uL3NyYy9leHRyYXMvRGF0YVV0aWxzLmpzIiwiLi4vZXhhbXBsZXMvanNtL2xvYWRlcnMvUkdCRUxvYWRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgUkVWSVNJT04gPSAnMTU0JztcblxuZXhwb3J0IGNvbnN0IE1PVVNFID0geyBMRUZUOiAwLCBNSURETEU6IDEsIFJJR0hUOiAyLCBST1RBVEU6IDAsIERPTExZOiAxLCBQQU46IDIgfTtcbmV4cG9ydCBjb25zdCBUT1VDSCA9IHsgUk9UQVRFOiAwLCBQQU46IDEsIERPTExZX1BBTjogMiwgRE9MTFlfUk9UQVRFOiAzIH07XG5leHBvcnQgY29uc3QgQ3VsbEZhY2VOb25lID0gMDtcbmV4cG9ydCBjb25zdCBDdWxsRmFjZUJhY2sgPSAxO1xuZXhwb3J0IGNvbnN0IEN1bGxGYWNlRnJvbnQgPSAyO1xuZXhwb3J0IGNvbnN0IEN1bGxGYWNlRnJvbnRCYWNrID0gMztcbmV4cG9ydCBjb25zdCBCYXNpY1NoYWRvd01hcCA9IDA7XG5leHBvcnQgY29uc3QgUENGU2hhZG93TWFwID0gMTtcbmV4cG9ydCBjb25zdCBQQ0ZTb2Z0U2hhZG93TWFwID0gMjtcbmV4cG9ydCBjb25zdCBWU01TaGFkb3dNYXAgPSAzO1xuZXhwb3J0IGNvbnN0IEZyb250U2lkZSA9IDA7XG5leHBvcnQgY29uc3QgQmFja1NpZGUgPSAxO1xuZXhwb3J0IGNvbnN0IERvdWJsZVNpZGUgPSAyO1xuZXhwb3J0IGNvbnN0IFR3b1Bhc3NEb3VibGVTaWRlID0gMjsgLy8gcjE0OVxuZXhwb3J0IGNvbnN0IE5vQmxlbmRpbmcgPSAwO1xuZXhwb3J0IGNvbnN0IE5vcm1hbEJsZW5kaW5nID0gMTtcbmV4cG9ydCBjb25zdCBBZGRpdGl2ZUJsZW5kaW5nID0gMjtcbmV4cG9ydCBjb25zdCBTdWJ0cmFjdGl2ZUJsZW5kaW5nID0gMztcbmV4cG9ydCBjb25zdCBNdWx0aXBseUJsZW5kaW5nID0gNDtcbmV4cG9ydCBjb25zdCBDdXN0b21CbGVuZGluZyA9IDU7XG5leHBvcnQgY29uc3QgQWRkRXF1YXRpb24gPSAxMDA7XG5leHBvcnQgY29uc3QgU3VidHJhY3RFcXVhdGlvbiA9IDEwMTtcbmV4cG9ydCBjb25zdCBSZXZlcnNlU3VidHJhY3RFcXVhdGlvbiA9IDEwMjtcbmV4cG9ydCBjb25zdCBNaW5FcXVhdGlvbiA9IDEwMztcbmV4cG9ydCBjb25zdCBNYXhFcXVhdGlvbiA9IDEwNDtcbmV4cG9ydCBjb25zdCBaZXJvRmFjdG9yID0gMjAwO1xuZXhwb3J0IGNvbnN0IE9uZUZhY3RvciA9IDIwMTtcbmV4cG9ydCBjb25zdCBTcmNDb2xvckZhY3RvciA9IDIwMjtcbmV4cG9ydCBjb25zdCBPbmVNaW51c1NyY0NvbG9yRmFjdG9yID0gMjAzO1xuZXhwb3J0IGNvbnN0IFNyY0FscGhhRmFjdG9yID0gMjA0O1xuZXhwb3J0IGNvbnN0IE9uZU1pbnVzU3JjQWxwaGFGYWN0b3IgPSAyMDU7XG5leHBvcnQgY29uc3QgRHN0QWxwaGFGYWN0b3IgPSAyMDY7XG5leHBvcnQgY29uc3QgT25lTWludXNEc3RBbHBoYUZhY3RvciA9IDIwNztcbmV4cG9ydCBjb25zdCBEc3RDb2xvckZhY3RvciA9IDIwODtcbmV4cG9ydCBjb25zdCBPbmVNaW51c0RzdENvbG9yRmFjdG9yID0gMjA5O1xuZXhwb3J0IGNvbnN0IFNyY0FscGhhU2F0dXJhdGVGYWN0b3IgPSAyMTA7XG5leHBvcnQgY29uc3QgTmV2ZXJEZXB0aCA9IDA7XG5leHBvcnQgY29uc3QgQWx3YXlzRGVwdGggPSAxO1xuZXhwb3J0IGNvbnN0IExlc3NEZXB0aCA9IDI7XG5leHBvcnQgY29uc3QgTGVzc0VxdWFsRGVwdGggPSAzO1xuZXhwb3J0IGNvbnN0IEVxdWFsRGVwdGggPSA0O1xuZXhwb3J0IGNvbnN0IEdyZWF0ZXJFcXVhbERlcHRoID0gNTtcbmV4cG9ydCBjb25zdCBHcmVhdGVyRGVwdGggPSA2O1xuZXhwb3J0IGNvbnN0IE5vdEVxdWFsRGVwdGggPSA3O1xuZXhwb3J0IGNvbnN0IE11bHRpcGx5T3BlcmF0aW9uID0gMDtcbmV4cG9ydCBjb25zdCBNaXhPcGVyYXRpb24gPSAxO1xuZXhwb3J0IGNvbnN0IEFkZE9wZXJhdGlvbiA9IDI7XG5leHBvcnQgY29uc3QgTm9Ub25lTWFwcGluZyA9IDA7XG5leHBvcnQgY29uc3QgTGluZWFyVG9uZU1hcHBpbmcgPSAxO1xuZXhwb3J0IGNvbnN0IFJlaW5oYXJkVG9uZU1hcHBpbmcgPSAyO1xuZXhwb3J0IGNvbnN0IENpbmVvblRvbmVNYXBwaW5nID0gMztcbmV4cG9ydCBjb25zdCBBQ0VTRmlsbWljVG9uZU1hcHBpbmcgPSA0O1xuZXhwb3J0IGNvbnN0IEN1c3RvbVRvbmVNYXBwaW5nID0gNTtcblxuZXhwb3J0IGNvbnN0IFVWTWFwcGluZyA9IDMwMDtcbmV4cG9ydCBjb25zdCBDdWJlUmVmbGVjdGlvbk1hcHBpbmcgPSAzMDE7XG5leHBvcnQgY29uc3QgQ3ViZVJlZnJhY3Rpb25NYXBwaW5nID0gMzAyO1xuZXhwb3J0IGNvbnN0IEVxdWlyZWN0YW5ndWxhclJlZmxlY3Rpb25NYXBwaW5nID0gMzAzO1xuZXhwb3J0IGNvbnN0IEVxdWlyZWN0YW5ndWxhclJlZnJhY3Rpb25NYXBwaW5nID0gMzA0O1xuZXhwb3J0IGNvbnN0IEN1YmVVVlJlZmxlY3Rpb25NYXBwaW5nID0gMzA2O1xuZXhwb3J0IGNvbnN0IFJlcGVhdFdyYXBwaW5nID0gMTAwMDtcbmV4cG9ydCBjb25zdCBDbGFtcFRvRWRnZVdyYXBwaW5nID0gMTAwMTtcbmV4cG9ydCBjb25zdCBNaXJyb3JlZFJlcGVhdFdyYXBwaW5nID0gMTAwMjtcbmV4cG9ydCBjb25zdCBOZWFyZXN0RmlsdGVyID0gMTAwMztcbmV4cG9ydCBjb25zdCBOZWFyZXN0TWlwbWFwTmVhcmVzdEZpbHRlciA9IDEwMDQ7XG5leHBvcnQgY29uc3QgTmVhcmVzdE1pcE1hcE5lYXJlc3RGaWx0ZXIgPSAxMDA0O1xuZXhwb3J0IGNvbnN0IE5lYXJlc3RNaXBtYXBMaW5lYXJGaWx0ZXIgPSAxMDA1O1xuZXhwb3J0IGNvbnN0IE5lYXJlc3RNaXBNYXBMaW5lYXJGaWx0ZXIgPSAxMDA1O1xuZXhwb3J0IGNvbnN0IExpbmVhckZpbHRlciA9IDEwMDY7XG5leHBvcnQgY29uc3QgTGluZWFyTWlwbWFwTmVhcmVzdEZpbHRlciA9IDEwMDc7XG5leHBvcnQgY29uc3QgTGluZWFyTWlwTWFwTmVhcmVzdEZpbHRlciA9IDEwMDc7XG5leHBvcnQgY29uc3QgTGluZWFyTWlwbWFwTGluZWFyRmlsdGVyID0gMTAwODtcbmV4cG9ydCBjb25zdCBMaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXIgPSAxMDA4O1xuZXhwb3J0IGNvbnN0IFVuc2lnbmVkQnl0ZVR5cGUgPSAxMDA5O1xuZXhwb3J0IGNvbnN0IEJ5dGVUeXBlID0gMTAxMDtcbmV4cG9ydCBjb25zdCBTaG9ydFR5cGUgPSAxMDExO1xuZXhwb3J0IGNvbnN0IFVuc2lnbmVkU2hvcnRUeXBlID0gMTAxMjtcbmV4cG9ydCBjb25zdCBJbnRUeXBlID0gMTAxMztcbmV4cG9ydCBjb25zdCBVbnNpZ25lZEludFR5cGUgPSAxMDE0O1xuZXhwb3J0IGNvbnN0IEZsb2F0VHlwZSA9IDEwMTU7XG5leHBvcnQgY29uc3QgSGFsZkZsb2F0VHlwZSA9IDEwMTY7XG5leHBvcnQgY29uc3QgVW5zaWduZWRTaG9ydDQ0NDRUeXBlID0gMTAxNztcbmV4cG9ydCBjb25zdCBVbnNpZ25lZFNob3J0NTU1MVR5cGUgPSAxMDE4O1xuZXhwb3J0IGNvbnN0IFVuc2lnbmVkSW50MjQ4VHlwZSA9IDEwMjA7XG5leHBvcnQgY29uc3QgQWxwaGFGb3JtYXQgPSAxMDIxO1xuZXhwb3J0IGNvbnN0IFJHQkFGb3JtYXQgPSAxMDIzO1xuZXhwb3J0IGNvbnN0IEx1bWluYW5jZUZvcm1hdCA9IDEwMjQ7XG5leHBvcnQgY29uc3QgTHVtaW5hbmNlQWxwaGFGb3JtYXQgPSAxMDI1O1xuZXhwb3J0IGNvbnN0IERlcHRoRm9ybWF0ID0gMTAyNjtcbmV4cG9ydCBjb25zdCBEZXB0aFN0ZW5jaWxGb3JtYXQgPSAxMDI3O1xuZXhwb3J0IGNvbnN0IFJlZEZvcm1hdCA9IDEwMjg7XG5leHBvcnQgY29uc3QgUmVkSW50ZWdlckZvcm1hdCA9IDEwMjk7XG5leHBvcnQgY29uc3QgUkdGb3JtYXQgPSAxMDMwO1xuZXhwb3J0IGNvbnN0IFJHSW50ZWdlckZvcm1hdCA9IDEwMzE7XG5leHBvcnQgY29uc3QgUkdCQUludGVnZXJGb3JtYXQgPSAxMDMzO1xuXG5leHBvcnQgY29uc3QgUkdCX1MzVENfRFhUMV9Gb3JtYXQgPSAzMzc3NjtcbmV4cG9ydCBjb25zdCBSR0JBX1MzVENfRFhUMV9Gb3JtYXQgPSAzMzc3NztcbmV4cG9ydCBjb25zdCBSR0JBX1MzVENfRFhUM19Gb3JtYXQgPSAzMzc3ODtcbmV4cG9ydCBjb25zdCBSR0JBX1MzVENfRFhUNV9Gb3JtYXQgPSAzMzc3OTtcbmV4cG9ydCBjb25zdCBSR0JfUFZSVENfNEJQUFYxX0Zvcm1hdCA9IDM1ODQwO1xuZXhwb3J0IGNvbnN0IFJHQl9QVlJUQ18yQlBQVjFfRm9ybWF0ID0gMzU4NDE7XG5leHBvcnQgY29uc3QgUkdCQV9QVlJUQ180QlBQVjFfRm9ybWF0ID0gMzU4NDI7XG5leHBvcnQgY29uc3QgUkdCQV9QVlJUQ18yQlBQVjFfRm9ybWF0ID0gMzU4NDM7XG5leHBvcnQgY29uc3QgUkdCX0VUQzFfRm9ybWF0ID0gMzYxOTY7XG5leHBvcnQgY29uc3QgUkdCX0VUQzJfRm9ybWF0ID0gMzc0OTI7XG5leHBvcnQgY29uc3QgUkdCQV9FVEMyX0VBQ19Gb3JtYXQgPSAzNzQ5NjtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfNHg0X0Zvcm1hdCA9IDM3ODA4O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ181eDRfRm9ybWF0ID0gMzc4MDk7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzV4NV9Gb3JtYXQgPSAzNzgxMDtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfNng1X0Zvcm1hdCA9IDM3ODExO1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ182eDZfRm9ybWF0ID0gMzc4MTI7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzh4NV9Gb3JtYXQgPSAzNzgxMztcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfOHg2X0Zvcm1hdCA9IDM3ODE0O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ184eDhfRm9ybWF0ID0gMzc4MTU7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEweDVfRm9ybWF0ID0gMzc4MTY7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEweDZfRm9ybWF0ID0gMzc4MTc7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEweDhfRm9ybWF0ID0gMzc4MTg7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEweDEwX0Zvcm1hdCA9IDM3ODE5O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ18xMngxMF9Gb3JtYXQgPSAzNzgyMDtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfMTJ4MTJfRm9ybWF0ID0gMzc4MjE7XG5leHBvcnQgY29uc3QgUkdCQV9CUFRDX0Zvcm1hdCA9IDM2NDkyO1xuZXhwb3J0IGNvbnN0IFJFRF9SR1RDMV9Gb3JtYXQgPSAzNjI4MztcbmV4cG9ydCBjb25zdCBTSUdORURfUkVEX1JHVEMxX0Zvcm1hdCA9IDM2Mjg0O1xuZXhwb3J0IGNvbnN0IFJFRF9HUkVFTl9SR1RDMl9Gb3JtYXQgPSAzNjI4NTtcbmV4cG9ydCBjb25zdCBTSUdORURfUkVEX0dSRUVOX1JHVEMyX0Zvcm1hdCA9IDM2Mjg2O1xuZXhwb3J0IGNvbnN0IExvb3BPbmNlID0gMjIwMDtcbmV4cG9ydCBjb25zdCBMb29wUmVwZWF0ID0gMjIwMTtcbmV4cG9ydCBjb25zdCBMb29wUGluZ1BvbmcgPSAyMjAyO1xuZXhwb3J0IGNvbnN0IEludGVycG9sYXRlRGlzY3JldGUgPSAyMzAwO1xuZXhwb3J0IGNvbnN0IEludGVycG9sYXRlTGluZWFyID0gMjMwMTtcbmV4cG9ydCBjb25zdCBJbnRlcnBvbGF0ZVNtb290aCA9IDIzMDI7XG5leHBvcnQgY29uc3QgWmVyb0N1cnZhdHVyZUVuZGluZyA9IDI0MDA7XG5leHBvcnQgY29uc3QgWmVyb1Nsb3BlRW5kaW5nID0gMjQwMTtcbmV4cG9ydCBjb25zdCBXcmFwQXJvdW5kRW5kaW5nID0gMjQwMjtcbmV4cG9ydCBjb25zdCBOb3JtYWxBbmltYXRpb25CbGVuZE1vZGUgPSAyNTAwO1xuZXhwb3J0IGNvbnN0IEFkZGl0aXZlQW5pbWF0aW9uQmxlbmRNb2RlID0gMjUwMTtcbmV4cG9ydCBjb25zdCBUcmlhbmdsZXNEcmF3TW9kZSA9IDA7XG5leHBvcnQgY29uc3QgVHJpYW5nbGVTdHJpcERyYXdNb2RlID0gMTtcbmV4cG9ydCBjb25zdCBUcmlhbmdsZUZhbkRyYXdNb2RlID0gMjtcbi8qKiBAZGVwcmVjYXRlZCBVc2UgTGluZWFyU1JHQkNvbG9yU3BhY2Ugb3IgTm9Db2xvclNwYWNlIGluIHRocmVlLmpzIHIxNTIrLiAqL1xuZXhwb3J0IGNvbnN0IExpbmVhckVuY29kaW5nID0gMzAwMDtcbi8qKiBAZGVwcmVjYXRlZCBVc2UgU1JHQkNvbG9yU3BhY2UgaW4gdGhyZWUuanMgcjE1MisuICovXG5leHBvcnQgY29uc3Qgc1JHQkVuY29kaW5nID0gMzAwMTtcbmV4cG9ydCBjb25zdCBCYXNpY0RlcHRoUGFja2luZyA9IDMyMDA7XG5leHBvcnQgY29uc3QgUkdCQURlcHRoUGFja2luZyA9IDMyMDE7XG5leHBvcnQgY29uc3QgVGFuZ2VudFNwYWNlTm9ybWFsTWFwID0gMDtcbmV4cG9ydCBjb25zdCBPYmplY3RTcGFjZU5vcm1hbE1hcCA9IDE7XG5cbi8vIENvbG9yIHNwYWNlIHN0cmluZyBpZGVudGlmaWVycywgbWF0Y2hpbmcgQ1NTIENvbG9yIE1vZHVsZSBMZXZlbCA0IGFuZCBXZWJHUFUgbmFtZXMgd2hlcmUgYXZhaWxhYmxlLlxuZXhwb3J0IGNvbnN0IE5vQ29sb3JTcGFjZSA9ICcnO1xuZXhwb3J0IGNvbnN0IFNSR0JDb2xvclNwYWNlID0gJ3NyZ2InO1xuZXhwb3J0IGNvbnN0IExpbmVhclNSR0JDb2xvclNwYWNlID0gJ3NyZ2ItbGluZWFyJztcbmV4cG9ydCBjb25zdCBEaXNwbGF5UDNDb2xvclNwYWNlID0gJ2Rpc3BsYXktcDMnO1xuXG5leHBvcnQgY29uc3QgWmVyb1N0ZW5jaWxPcCA9IDA7XG5leHBvcnQgY29uc3QgS2VlcFN0ZW5jaWxPcCA9IDc2ODA7XG5leHBvcnQgY29uc3QgUmVwbGFjZVN0ZW5jaWxPcCA9IDc2ODE7XG5leHBvcnQgY29uc3QgSW5jcmVtZW50U3RlbmNpbE9wID0gNzY4MjtcbmV4cG9ydCBjb25zdCBEZWNyZW1lbnRTdGVuY2lsT3AgPSA3NjgzO1xuZXhwb3J0IGNvbnN0IEluY3JlbWVudFdyYXBTdGVuY2lsT3AgPSAzNDA1NTtcbmV4cG9ydCBjb25zdCBEZWNyZW1lbnRXcmFwU3RlbmNpbE9wID0gMzQwNTY7XG5leHBvcnQgY29uc3QgSW52ZXJ0U3RlbmNpbE9wID0gNTM4NjtcblxuZXhwb3J0IGNvbnN0IE5ldmVyU3RlbmNpbEZ1bmMgPSA1MTI7XG5leHBvcnQgY29uc3QgTGVzc1N0ZW5jaWxGdW5jID0gNTEzO1xuZXhwb3J0IGNvbnN0IEVxdWFsU3RlbmNpbEZ1bmMgPSA1MTQ7XG5leHBvcnQgY29uc3QgTGVzc0VxdWFsU3RlbmNpbEZ1bmMgPSA1MTU7XG5leHBvcnQgY29uc3QgR3JlYXRlclN0ZW5jaWxGdW5jID0gNTE2O1xuZXhwb3J0IGNvbnN0IE5vdEVxdWFsU3RlbmNpbEZ1bmMgPSA1MTc7XG5leHBvcnQgY29uc3QgR3JlYXRlckVxdWFsU3RlbmNpbEZ1bmMgPSA1MTg7XG5leHBvcnQgY29uc3QgQWx3YXlzU3RlbmNpbEZ1bmMgPSA1MTk7XG5cbmV4cG9ydCBjb25zdCBOZXZlckNvbXBhcmUgPSA1MTI7XG5leHBvcnQgY29uc3QgTGVzc0NvbXBhcmUgPSA1MTM7XG5leHBvcnQgY29uc3QgRXF1YWxDb21wYXJlID0gNTE0O1xuZXhwb3J0IGNvbnN0IExlc3NFcXVhbENvbXBhcmUgPSA1MTU7XG5leHBvcnQgY29uc3QgR3JlYXRlckNvbXBhcmUgPSA1MTY7XG5leHBvcnQgY29uc3QgTm90RXF1YWxDb21wYXJlID0gNTE3O1xuZXhwb3J0IGNvbnN0IEdyZWF0ZXJFcXVhbENvbXBhcmUgPSA1MTg7XG5leHBvcnQgY29uc3QgQWx3YXlzQ29tcGFyZSA9IDUxOTtcblxuZXhwb3J0IGNvbnN0IFN0YXRpY0RyYXdVc2FnZSA9IDM1MDQ0O1xuZXhwb3J0IGNvbnN0IER5bmFtaWNEcmF3VXNhZ2UgPSAzNTA0ODtcbmV4cG9ydCBjb25zdCBTdHJlYW1EcmF3VXNhZ2UgPSAzNTA0MDtcbmV4cG9ydCBjb25zdCBTdGF0aWNSZWFkVXNhZ2UgPSAzNTA0NTtcbmV4cG9ydCBjb25zdCBEeW5hbWljUmVhZFVzYWdlID0gMzUwNDk7XG5leHBvcnQgY29uc3QgU3RyZWFtUmVhZFVzYWdlID0gMzUwNDE7XG5leHBvcnQgY29uc3QgU3RhdGljQ29weVVzYWdlID0gMzUwNDY7XG5leHBvcnQgY29uc3QgRHluYW1pY0NvcHlVc2FnZSA9IDM1MDUwO1xuZXhwb3J0IGNvbnN0IFN0cmVhbUNvcHlVc2FnZSA9IDM1MDQyO1xuXG5leHBvcnQgY29uc3QgR0xTTDEgPSAnMTAwJztcbmV4cG9ydCBjb25zdCBHTFNMMyA9ICczMDAgZXMnO1xuXG5leHBvcnQgY29uc3QgX1NSR0JBRm9ybWF0ID0gMTAzNTsgLy8gZmFsbGJhY2sgZm9yIFdlYkdMIDFcblxuZXhwb3J0IGNvbnN0IFdlYkdMQ29vcmRpbmF0ZVN5c3RlbSA9IDIwMDA7XG5leHBvcnQgY29uc3QgV2ViR1BVQ29vcmRpbmF0ZVN5c3RlbSA9IDIwMDE7XG4iLCJjb25zdCBDYWNoZSA9IHtcblxuXHRlbmFibGVkOiBmYWxzZSxcblxuXHRmaWxlczoge30sXG5cblx0YWRkOiBmdW5jdGlvbiAoIGtleSwgZmlsZSApIHtcblxuXHRcdGlmICggdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdC8vIGNvbnNvbGUubG9nKCAnVEhSRUUuQ2FjaGUnLCAnQWRkaW5nIGtleTonLCBrZXkgKTtcblxuXHRcdHRoaXMuZmlsZXNbIGtleSBdID0gZmlsZTtcblxuXHR9LFxuXG5cdGdldDogZnVuY3Rpb24gKCBrZXkgKSB7XG5cblx0XHRpZiAoIHRoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHQvLyBjb25zb2xlLmxvZyggJ1RIUkVFLkNhY2hlJywgJ0NoZWNraW5nIGtleTonLCBrZXkgKTtcblxuXHRcdHJldHVybiB0aGlzLmZpbGVzWyBrZXkgXTtcblxuXHR9LFxuXG5cdHJlbW92ZTogZnVuY3Rpb24gKCBrZXkgKSB7XG5cblx0XHRkZWxldGUgdGhpcy5maWxlc1sga2V5IF07XG5cblx0fSxcblxuXHRjbGVhcjogZnVuY3Rpb24gKCkge1xuXG5cdFx0dGhpcy5maWxlcyA9IHt9O1xuXG5cdH1cblxufTtcblxuXG5leHBvcnQgeyBDYWNoZSB9O1xuIiwiY2xhc3MgTG9hZGluZ01hbmFnZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBvbkxvYWQsIG9uUHJvZ3Jlc3MsIG9uRXJyb3IgKSB7XG5cblx0XHRjb25zdCBzY29wZSA9IHRoaXM7XG5cblx0XHRsZXQgaXNMb2FkaW5nID0gZmFsc2U7XG5cdFx0bGV0IGl0ZW1zTG9hZGVkID0gMDtcblx0XHRsZXQgaXRlbXNUb3RhbCA9IDA7XG5cdFx0bGV0IHVybE1vZGlmaWVyID0gdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGhhbmRsZXJzID0gW107XG5cblx0XHQvLyBSZWZlciB0byAjNTY4OSBmb3IgdGhlIHJlYXNvbiB3aHkgd2UgZG9uJ3Qgc2V0IC5vblN0YXJ0XG5cdFx0Ly8gaW4gdGhlIGNvbnN0cnVjdG9yXG5cblx0XHR0aGlzLm9uU3RhcnQgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5vbkxvYWQgPSBvbkxvYWQ7XG5cdFx0dGhpcy5vblByb2dyZXNzID0gb25Qcm9ncmVzcztcblx0XHR0aGlzLm9uRXJyb3IgPSBvbkVycm9yO1xuXG5cdFx0dGhpcy5pdGVtU3RhcnQgPSBmdW5jdGlvbiAoIHVybCApIHtcblxuXHRcdFx0aXRlbXNUb3RhbCArKztcblxuXHRcdFx0aWYgKCBpc0xvYWRpbmcgPT09IGZhbHNlICkge1xuXG5cdFx0XHRcdGlmICggc2NvcGUub25TdGFydCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0c2NvcGUub25TdGFydCggdXJsLCBpdGVtc0xvYWRlZCwgaXRlbXNUb3RhbCApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHRpc0xvYWRpbmcgPSB0cnVlO1xuXG5cdFx0fTtcblxuXHRcdHRoaXMuaXRlbUVuZCA9IGZ1bmN0aW9uICggdXJsICkge1xuXG5cdFx0XHRpdGVtc0xvYWRlZCArKztcblxuXHRcdFx0aWYgKCBzY29wZS5vblByb2dyZXNzICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0c2NvcGUub25Qcm9ncmVzcyggdXJsLCBpdGVtc0xvYWRlZCwgaXRlbXNUb3RhbCApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggaXRlbXNMb2FkZWQgPT09IGl0ZW1zVG90YWwgKSB7XG5cblx0XHRcdFx0aXNMb2FkaW5nID0gZmFsc2U7XG5cblx0XHRcdFx0aWYgKCBzY29wZS5vbkxvYWQgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRcdHNjb3BlLm9uTG9hZCgpO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fTtcblxuXHRcdHRoaXMuaXRlbUVycm9yID0gZnVuY3Rpb24gKCB1cmwgKSB7XG5cblx0XHRcdGlmICggc2NvcGUub25FcnJvciAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdHNjb3BlLm9uRXJyb3IoIHVybCApO1xuXG5cdFx0XHR9XG5cblx0XHR9O1xuXG5cdFx0dGhpcy5yZXNvbHZlVVJMID0gZnVuY3Rpb24gKCB1cmwgKSB7XG5cblx0XHRcdGlmICggdXJsTW9kaWZpZXIgKSB7XG5cblx0XHRcdFx0cmV0dXJuIHVybE1vZGlmaWVyKCB1cmwgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdXJsO1xuXG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0VVJMTW9kaWZpZXIgPSBmdW5jdGlvbiAoIHRyYW5zZm9ybSApIHtcblxuXHRcdFx0dXJsTW9kaWZpZXIgPSB0cmFuc2Zvcm07XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0fTtcblxuXHRcdHRoaXMuYWRkSGFuZGxlciA9IGZ1bmN0aW9uICggcmVnZXgsIGxvYWRlciApIHtcblxuXHRcdFx0aGFuZGxlcnMucHVzaCggcmVnZXgsIGxvYWRlciApO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblxuXHRcdH07XG5cblx0XHR0aGlzLnJlbW92ZUhhbmRsZXIgPSBmdW5jdGlvbiAoIHJlZ2V4ICkge1xuXG5cdFx0XHRjb25zdCBpbmRleCA9IGhhbmRsZXJzLmluZGV4T2YoIHJlZ2V4ICk7XG5cblx0XHRcdGlmICggaW5kZXggIT09IC0gMSApIHtcblxuXHRcdFx0XHRoYW5kbGVycy5zcGxpY2UoIGluZGV4LCAyICk7XG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHR9O1xuXG5cdFx0dGhpcy5nZXRIYW5kbGVyID0gZnVuY3Rpb24gKCBmaWxlICkge1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGwgPSBoYW5kbGVycy5sZW5ndGg7IGkgPCBsOyBpICs9IDIgKSB7XG5cblx0XHRcdFx0Y29uc3QgcmVnZXggPSBoYW5kbGVyc1sgaSBdO1xuXHRcdFx0XHRjb25zdCBsb2FkZXIgPSBoYW5kbGVyc1sgaSArIDEgXTtcblxuXHRcdFx0XHRpZiAoIHJlZ2V4Lmdsb2JhbCApIHJlZ2V4Lmxhc3RJbmRleCA9IDA7IC8vIHNlZSAjMTc5MjBcblxuXHRcdFx0XHRpZiAoIHJlZ2V4LnRlc3QoIGZpbGUgKSApIHtcblxuXHRcdFx0XHRcdHJldHVybiBsb2FkZXI7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXG5cdFx0fTtcblxuXHR9XG5cbn1cblxuY29uc3QgRGVmYXVsdExvYWRpbmdNYW5hZ2VyID0gLypAX19QVVJFX18qLyBuZXcgTG9hZGluZ01hbmFnZXIoKTtcblxuZXhwb3J0IHsgRGVmYXVsdExvYWRpbmdNYW5hZ2VyLCBMb2FkaW5nTWFuYWdlciB9O1xuIiwiaW1wb3J0IHsgRGVmYXVsdExvYWRpbmdNYW5hZ2VyIH0gZnJvbSAnLi9Mb2FkaW5nTWFuYWdlci5qcyc7XG5cbmNsYXNzIExvYWRlciB7XG5cblx0Y29uc3RydWN0b3IoIG1hbmFnZXIgKSB7XG5cblx0XHR0aGlzLm1hbmFnZXIgPSAoIG1hbmFnZXIgIT09IHVuZGVmaW5lZCApID8gbWFuYWdlciA6IERlZmF1bHRMb2FkaW5nTWFuYWdlcjtcblxuXHRcdHRoaXMuY3Jvc3NPcmlnaW4gPSAnYW5vbnltb3VzJztcblx0XHR0aGlzLndpdGhDcmVkZW50aWFscyA9IGZhbHNlO1xuXHRcdHRoaXMucGF0aCA9ICcnO1xuXHRcdHRoaXMucmVzb3VyY2VQYXRoID0gJyc7XG5cdFx0dGhpcy5yZXF1ZXN0SGVhZGVyID0ge307XG5cblx0fVxuXG5cdGxvYWQoIC8qIHVybCwgb25Mb2FkLCBvblByb2dyZXNzLCBvbkVycm9yICovICkge31cblxuXHRsb2FkQXN5bmMoIHVybCwgb25Qcm9ncmVzcyApIHtcblxuXHRcdGNvbnN0IHNjb3BlID0gdGhpcztcblxuXHRcdHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24gKCByZXNvbHZlLCByZWplY3QgKSB7XG5cblx0XHRcdHNjb3BlLmxvYWQoIHVybCwgcmVzb2x2ZSwgb25Qcm9ncmVzcywgcmVqZWN0ICk7XG5cblx0XHR9ICk7XG5cblx0fVxuXG5cdHBhcnNlKCAvKiBkYXRhICovICkge31cblxuXHRzZXRDcm9zc09yaWdpbiggY3Jvc3NPcmlnaW4gKSB7XG5cblx0XHR0aGlzLmNyb3NzT3JpZ2luID0gY3Jvc3NPcmlnaW47XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldFdpdGhDcmVkZW50aWFscyggdmFsdWUgKSB7XG5cblx0XHR0aGlzLndpdGhDcmVkZW50aWFscyA9IHZhbHVlO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRQYXRoKCBwYXRoICkge1xuXG5cdFx0dGhpcy5wYXRoID0gcGF0aDtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0UmVzb3VyY2VQYXRoKCByZXNvdXJjZVBhdGggKSB7XG5cblx0XHR0aGlzLnJlc291cmNlUGF0aCA9IHJlc291cmNlUGF0aDtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0UmVxdWVzdEhlYWRlciggcmVxdWVzdEhlYWRlciApIHtcblxuXHRcdHRoaXMucmVxdWVzdEhlYWRlciA9IHJlcXVlc3RIZWFkZXI7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG59XG5cbkxvYWRlci5ERUZBVUxUX01BVEVSSUFMX05BTUUgPSAnX19ERUZBVUxUJztcblxuZXhwb3J0IHsgTG9hZGVyIH07XG4iLCJpbXBvcnQgeyBDYWNoZSB9IGZyb20gJy4vQ2FjaGUuanMnO1xuaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSAnLi9Mb2FkZXIuanMnO1xuXG5jb25zdCBsb2FkaW5nID0ge307XG5cbmNsYXNzIEh0dHBFcnJvciBleHRlbmRzIEVycm9yIHtcblxuXHRjb25zdHJ1Y3RvciggbWVzc2FnZSwgcmVzcG9uc2UgKSB7XG5cblx0XHRzdXBlciggbWVzc2FnZSApO1xuXHRcdHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcblxuXHR9XG5cbn1cblxuY2xhc3MgRmlsZUxvYWRlciBleHRlbmRzIExvYWRlciB7XG5cblx0Y29uc3RydWN0b3IoIG1hbmFnZXIgKSB7XG5cblx0XHRzdXBlciggbWFuYWdlciApO1xuXG5cdH1cblxuXHRsb2FkKCB1cmwsIG9uTG9hZCwgb25Qcm9ncmVzcywgb25FcnJvciApIHtcblxuXHRcdGlmICggdXJsID09PSB1bmRlZmluZWQgKSB1cmwgPSAnJztcblxuXHRcdGlmICggdGhpcy5wYXRoICE9PSB1bmRlZmluZWQgKSB1cmwgPSB0aGlzLnBhdGggKyB1cmw7XG5cblx0XHR1cmwgPSB0aGlzLm1hbmFnZXIucmVzb2x2ZVVSTCggdXJsICk7XG5cblx0XHRjb25zdCBjYWNoZWQgPSBDYWNoZS5nZXQoIHVybCApO1xuXG5cdFx0aWYgKCBjYWNoZWQgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0dGhpcy5tYW5hZ2VyLml0ZW1TdGFydCggdXJsICk7XG5cblx0XHRcdHNldFRpbWVvdXQoICgpID0+IHtcblxuXHRcdFx0XHRpZiAoIG9uTG9hZCApIG9uTG9hZCggY2FjaGVkICk7XG5cblx0XHRcdFx0dGhpcy5tYW5hZ2VyLml0ZW1FbmQoIHVybCApO1xuXG5cdFx0XHR9LCAwICk7XG5cblx0XHRcdHJldHVybiBjYWNoZWQ7XG5cblx0XHR9XG5cblx0XHQvLyBDaGVjayBpZiByZXF1ZXN0IGlzIGR1cGxpY2F0ZVxuXG5cdFx0aWYgKCBsb2FkaW5nWyB1cmwgXSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRsb2FkaW5nWyB1cmwgXS5wdXNoKCB7XG5cblx0XHRcdFx0b25Mb2FkOiBvbkxvYWQsXG5cdFx0XHRcdG9uUHJvZ3Jlc3M6IG9uUHJvZ3Jlc3MsXG5cdFx0XHRcdG9uRXJyb3I6IG9uRXJyb3JcblxuXHRcdFx0fSApO1xuXG5cdFx0XHRyZXR1cm47XG5cblx0XHR9XG5cblx0XHQvLyBJbml0aWFsaXNlIGFycmF5IGZvciBkdXBsaWNhdGUgcmVxdWVzdHNcblx0XHRsb2FkaW5nWyB1cmwgXSA9IFtdO1xuXG5cdFx0bG9hZGluZ1sgdXJsIF0ucHVzaCgge1xuXHRcdFx0b25Mb2FkOiBvbkxvYWQsXG5cdFx0XHRvblByb2dyZXNzOiBvblByb2dyZXNzLFxuXHRcdFx0b25FcnJvcjogb25FcnJvcixcblx0XHR9ICk7XG5cblx0XHQvLyBjcmVhdGUgcmVxdWVzdFxuXHRcdGNvbnN0IHJlcSA9IG5ldyBSZXF1ZXN0KCB1cmwsIHtcblx0XHRcdGhlYWRlcnM6IG5ldyBIZWFkZXJzKCB0aGlzLnJlcXVlc3RIZWFkZXIgKSxcblx0XHRcdGNyZWRlbnRpYWxzOiB0aGlzLndpdGhDcmVkZW50aWFscyA/ICdpbmNsdWRlJyA6ICdzYW1lLW9yaWdpbicsXG5cdFx0XHQvLyBBbiBhYm9ydCBjb250cm9sbGVyIGNvdWxkIGJlIGFkZGVkIHdpdGhpbiBhIGZ1dHVyZSBQUlxuXHRcdH0gKTtcblxuXHRcdC8vIHJlY29yZCBzdGF0ZXMgKCBhdm9pZCBkYXRhIHJhY2UgKVxuXHRcdGNvbnN0IG1pbWVUeXBlID0gdGhpcy5taW1lVHlwZTtcblx0XHRjb25zdCByZXNwb25zZVR5cGUgPSB0aGlzLnJlc3BvbnNlVHlwZTtcblxuXHRcdC8vIHN0YXJ0IHRoZSBmZXRjaFxuXHRcdGZldGNoKCByZXEgKVxuXHRcdFx0LnRoZW4oIHJlc3BvbnNlID0+IHtcblxuXHRcdFx0XHRpZiAoIHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwIHx8IHJlc3BvbnNlLnN0YXR1cyA9PT0gMCApIHtcblxuXHRcdFx0XHRcdC8vIFNvbWUgYnJvd3NlcnMgcmV0dXJuIEhUVFAgU3RhdHVzIDAgd2hlbiB1c2luZyBub24taHR0cCBwcm90b2NvbFxuXHRcdFx0XHRcdC8vIGUuZy4gJ2ZpbGU6Ly8nIG9yICdkYXRhOi8vJy4gSGFuZGxlIGFzIHN1Y2Nlc3MuXG5cblx0XHRcdFx0XHRpZiAoIHJlc3BvbnNlLnN0YXR1cyA9PT0gMCApIHtcblxuXHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuRmlsZUxvYWRlcjogSFRUUCBTdGF0dXMgMCByZWNlaXZlZC4nICk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBXb3JrYXJvdW5kOiBDaGVja2luZyBpZiByZXNwb25zZS5ib2R5ID09PSB1bmRlZmluZWQgZm9yIEFsaXBheSBicm93c2VyICMyMzU0OFxuXG5cdFx0XHRcdFx0aWYgKCB0eXBlb2YgUmVhZGFibGVTdHJlYW0gPT09ICd1bmRlZmluZWQnIHx8IHJlc3BvbnNlLmJvZHkgPT09IHVuZGVmaW5lZCB8fCByZXNwb25zZS5ib2R5LmdldFJlYWRlciA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2U7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBjYWxsYmFja3MgPSBsb2FkaW5nWyB1cmwgXTtcblx0XHRcdFx0XHRjb25zdCByZWFkZXIgPSByZXNwb25zZS5ib2R5LmdldFJlYWRlcigpO1xuXG5cdFx0XHRcdFx0Ly8gTmdpbnggbmVlZHMgWC1GaWxlLVNpemUgY2hlY2tcblx0XHRcdFx0XHQvLyBodHRwczovL3NlcnZlcmZhdWx0LmNvbS9xdWVzdGlvbnMvNDgyODc1L3doeS1kb2VzLW5naW54LXJlbW92ZS1jb250ZW50LWxlbmd0aC1oZWFkZXItZm9yLWNodW5rZWQtY29udGVudFxuXHRcdFx0XHRcdGNvbnN0IGNvbnRlbnRMZW5ndGggPSByZXNwb25zZS5oZWFkZXJzLmdldCggJ0NvbnRlbnQtTGVuZ3RoJyApIHx8IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCAnWC1GaWxlLVNpemUnICk7XG5cdFx0XHRcdFx0Y29uc3QgdG90YWwgPSBjb250ZW50TGVuZ3RoID8gcGFyc2VJbnQoIGNvbnRlbnRMZW5ndGggKSA6IDA7XG5cdFx0XHRcdFx0Y29uc3QgbGVuZ3RoQ29tcHV0YWJsZSA9IHRvdGFsICE9PSAwO1xuXHRcdFx0XHRcdGxldCBsb2FkZWQgPSAwO1xuXG5cdFx0XHRcdFx0Ly8gcGVyaW9kaWNhbGx5IHJlYWQgZGF0YSBpbnRvIHRoZSBuZXcgc3RyZWFtIHRyYWNraW5nIHdoaWxlIGRvd25sb2FkIHByb2dyZXNzXG5cdFx0XHRcdFx0Y29uc3Qgc3RyZWFtID0gbmV3IFJlYWRhYmxlU3RyZWFtKCB7XG5cdFx0XHRcdFx0XHRzdGFydCggY29udHJvbGxlciApIHtcblxuXHRcdFx0XHRcdFx0XHRyZWFkRGF0YSgpO1xuXG5cdFx0XHRcdFx0XHRcdGZ1bmN0aW9uIHJlYWREYXRhKCkge1xuXG5cdFx0XHRcdFx0XHRcdFx0cmVhZGVyLnJlYWQoKS50aGVuKCAoIHsgZG9uZSwgdmFsdWUgfSApID0+IHtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCBkb25lICkge1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuY2xvc2UoKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRsb2FkZWQgKz0gdmFsdWUuYnl0ZUxlbmd0aDtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBldmVudCA9IG5ldyBQcm9ncmVzc0V2ZW50KCAncHJvZ3Jlc3MnLCB7IGxlbmd0aENvbXB1dGFibGUsIGxvYWRlZCwgdG90YWwgfSApO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGlsOyBpICsrICkge1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgY2FsbGJhY2sgPSBjYWxsYmFja3NbIGkgXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoIGNhbGxiYWNrLm9uUHJvZ3Jlc3MgKSBjYWxsYmFjay5vblByb2dyZXNzKCBldmVudCApO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb250cm9sbGVyLmVucXVldWUoIHZhbHVlICk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlYWREYXRhKCk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdHJldHVybiBuZXcgUmVzcG9uc2UoIHN0cmVhbSApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHR0aHJvdyBuZXcgSHR0cEVycm9yKCBgZmV0Y2ggZm9yIFwiJHtyZXNwb25zZS51cmx9XCIgcmVzcG9uZGVkIHdpdGggJHtyZXNwb25zZS5zdGF0dXN9OiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCwgcmVzcG9uc2UgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH0gKVxuXHRcdFx0LnRoZW4oIHJlc3BvbnNlID0+IHtcblxuXHRcdFx0XHRzd2l0Y2ggKCByZXNwb25zZVR5cGUgKSB7XG5cblx0XHRcdFx0XHRjYXNlICdhcnJheWJ1ZmZlcic6XG5cblx0XHRcdFx0XHRcdHJldHVybiByZXNwb25zZS5hcnJheUJ1ZmZlcigpO1xuXG5cdFx0XHRcdFx0Y2FzZSAnYmxvYic6XG5cblx0XHRcdFx0XHRcdHJldHVybiByZXNwb25zZS5ibG9iKCk7XG5cblx0XHRcdFx0XHRjYXNlICdkb2N1bWVudCc6XG5cblx0XHRcdFx0XHRcdHJldHVybiByZXNwb25zZS50ZXh0KClcblx0XHRcdFx0XHRcdFx0LnRoZW4oIHRleHQgPT4ge1xuXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKCB0ZXh0LCBtaW1lVHlwZSApO1xuXG5cdFx0XHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdGNhc2UgJ2pzb24nOlxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblxuXHRcdFx0XHRcdFx0aWYgKCBtaW1lVHlwZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXNwb25zZS50ZXh0KCk7XG5cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gc25pZmYgZW5jb2Rpbmdcblx0XHRcdFx0XHRcdFx0Y29uc3QgcmUgPSAvY2hhcnNldD1cIj8oW147XCJcXHNdKilcIj8vaTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZXhlYyA9IHJlLmV4ZWMoIG1pbWVUeXBlICk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGxhYmVsID0gZXhlYyAmJiBleGVjWyAxIF0gPyBleGVjWyAxIF0udG9Mb3dlckNhc2UoKSA6IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlciggbGFiZWwgKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmFycmF5QnVmZmVyKCkudGhlbiggYWIgPT4gZGVjb2Rlci5kZWNvZGUoIGFiICkgKTtcblxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0fSApXG5cdFx0XHQudGhlbiggZGF0YSA9PiB7XG5cblx0XHRcdFx0Ly8gQWRkIHRvIGNhY2hlIG9ubHkgb24gSFRUUCBzdWNjZXNzLCBzbyB0aGF0IHdlIGRvIG5vdCBjYWNoZVxuXHRcdFx0XHQvLyBlcnJvciByZXNwb25zZSBib2RpZXMgYXMgcHJvcGVyIHJlc3BvbnNlcyB0byByZXF1ZXN0cy5cblx0XHRcdFx0Q2FjaGUuYWRkKCB1cmwsIGRhdGEgKTtcblxuXHRcdFx0XHRjb25zdCBjYWxsYmFja3MgPSBsb2FkaW5nWyB1cmwgXTtcblx0XHRcdFx0ZGVsZXRlIGxvYWRpbmdbIHVybCBdO1xuXG5cdFx0XHRcdGZvciAoIGxldCBpID0gMCwgaWwgPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdFx0XHRjb25zdCBjYWxsYmFjayA9IGNhbGxiYWNrc1sgaSBdO1xuXHRcdFx0XHRcdGlmICggY2FsbGJhY2sub25Mb2FkICkgY2FsbGJhY2sub25Mb2FkKCBkYXRhICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9IClcblx0XHRcdC5jYXRjaCggZXJyID0+IHtcblxuXHRcdFx0XHQvLyBBYm9ydCBlcnJvcnMgYW5kIG90aGVyIGVycm9ycyBhcmUgaGFuZGxlZCB0aGUgc2FtZVxuXG5cdFx0XHRcdGNvbnN0IGNhbGxiYWNrcyA9IGxvYWRpbmdbIHVybCBdO1xuXG5cdFx0XHRcdGlmICggY2FsbGJhY2tzID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHQvLyBXaGVuIG9uTG9hZCB3YXMgY2FsbGVkIGFuZCB1cmwgd2FzIGRlbGV0ZWQgaW4gYGxvYWRpbmdgXG5cdFx0XHRcdFx0dGhpcy5tYW5hZ2VyLml0ZW1FcnJvciggdXJsICk7XG5cdFx0XHRcdFx0dGhyb3cgZXJyO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkZWxldGUgbG9hZGluZ1sgdXJsIF07XG5cblx0XHRcdFx0Zm9yICggbGV0IGkgPSAwLCBpbCA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBpbDsgaSArKyApIHtcblxuXHRcdFx0XHRcdGNvbnN0IGNhbGxiYWNrID0gY2FsbGJhY2tzWyBpIF07XG5cdFx0XHRcdFx0aWYgKCBjYWxsYmFjay5vbkVycm9yICkgY2FsbGJhY2sub25FcnJvciggZXJyICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMubWFuYWdlci5pdGVtRXJyb3IoIHVybCApO1xuXG5cdFx0XHR9IClcblx0XHRcdC5maW5hbGx5KCAoKSA9PiB7XG5cblx0XHRcdFx0dGhpcy5tYW5hZ2VyLml0ZW1FbmQoIHVybCApO1xuXG5cdFx0XHR9ICk7XG5cblx0XHR0aGlzLm1hbmFnZXIuaXRlbVN0YXJ0KCB1cmwgKTtcblxuXHR9XG5cblx0c2V0UmVzcG9uc2VUeXBlKCB2YWx1ZSApIHtcblxuXHRcdHRoaXMucmVzcG9uc2VUeXBlID0gdmFsdWU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldE1pbWVUeXBlKCB2YWx1ZSApIHtcblxuXHRcdHRoaXMubWltZVR5cGUgPSB2YWx1ZTtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cbn1cblxuXG5leHBvcnQgeyBGaWxlTG9hZGVyIH07XG4iLCIvKipcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvZXZlbnRkaXNwYXRjaGVyLmpzL1xuICovXG5cbmNsYXNzIEV2ZW50RGlzcGF0Y2hlciB7XG5cblx0YWRkRXZlbnRMaXN0ZW5lciggdHlwZSwgbGlzdGVuZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgdGhpcy5fbGlzdGVuZXJzID0ge307XG5cblx0XHRjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGxpc3RlbmVyc1sgdHlwZSBdID0gW107XG5cblx0XHR9XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdLmluZGV4T2YoIGxpc3RlbmVyICkgPT09IC0gMSApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0ucHVzaCggbGlzdGVuZXIgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0aGFzRXZlbnRMaXN0ZW5lciggdHlwZSwgbGlzdGVuZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0Y29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXG5cdFx0cmV0dXJuIGxpc3RlbmVyc1sgdHlwZSBdICE9PSB1bmRlZmluZWQgJiYgbGlzdGVuZXJzWyB0eXBlIF0uaW5kZXhPZiggbGlzdGVuZXIgKSAhPT0gLSAxO1xuXG5cdH1cblxuXHRyZW1vdmVFdmVudExpc3RlbmVyKCB0eXBlLCBsaXN0ZW5lciApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSByZXR1cm47XG5cblx0XHRjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cdFx0Y29uc3QgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgdHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGNvbnN0IGluZGV4ID0gbGlzdGVuZXJBcnJheS5pbmRleE9mKCBsaXN0ZW5lciApO1xuXG5cdFx0XHRpZiAoIGluZGV4ICE9PSAtIDEgKSB7XG5cblx0XHRcdFx0bGlzdGVuZXJBcnJheS5zcGxpY2UoIGluZGV4LCAxICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cblx0ZGlzcGF0Y2hFdmVudCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0Y29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXHRcdGNvbnN0IGxpc3RlbmVyQXJyYXkgPSBsaXN0ZW5lcnNbIGV2ZW50LnR5cGUgXTtcblxuXHRcdGlmICggbGlzdGVuZXJBcnJheSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRldmVudC50YXJnZXQgPSB0aGlzO1xuXG5cdFx0XHQvLyBNYWtlIGEgY29weSwgaW4gY2FzZSBsaXN0ZW5lcnMgYXJlIHJlbW92ZWQgd2hpbGUgaXRlcmF0aW5nLlxuXHRcdFx0Y29uc3QgYXJyYXkgPSBsaXN0ZW5lckFycmF5LnNsaWNlKCAwICk7XG5cblx0XHRcdGZvciAoIGxldCBpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDsgaSA8IGw7IGkgKysgKSB7XG5cblx0XHRcdFx0YXJyYXlbIGkgXS5jYWxsKCB0aGlzLCBldmVudCApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGV2ZW50LnRhcmdldCA9IG51bGw7XG5cblx0XHR9XG5cblx0fVxuXG59XG5cblxuZXhwb3J0IHsgRXZlbnREaXNwYXRjaGVyIH07XG4iLCJjb25zdCBfbHV0ID0gWyAnMDAnLCAnMDEnLCAnMDInLCAnMDMnLCAnMDQnLCAnMDUnLCAnMDYnLCAnMDcnLCAnMDgnLCAnMDknLCAnMGEnLCAnMGInLCAnMGMnLCAnMGQnLCAnMGUnLCAnMGYnLCAnMTAnLCAnMTEnLCAnMTInLCAnMTMnLCAnMTQnLCAnMTUnLCAnMTYnLCAnMTcnLCAnMTgnLCAnMTknLCAnMWEnLCAnMWInLCAnMWMnLCAnMWQnLCAnMWUnLCAnMWYnLCAnMjAnLCAnMjEnLCAnMjInLCAnMjMnLCAnMjQnLCAnMjUnLCAnMjYnLCAnMjcnLCAnMjgnLCAnMjknLCAnMmEnLCAnMmInLCAnMmMnLCAnMmQnLCAnMmUnLCAnMmYnLCAnMzAnLCAnMzEnLCAnMzInLCAnMzMnLCAnMzQnLCAnMzUnLCAnMzYnLCAnMzcnLCAnMzgnLCAnMzknLCAnM2EnLCAnM2InLCAnM2MnLCAnM2QnLCAnM2UnLCAnM2YnLCAnNDAnLCAnNDEnLCAnNDInLCAnNDMnLCAnNDQnLCAnNDUnLCAnNDYnLCAnNDcnLCAnNDgnLCAnNDknLCAnNGEnLCAnNGInLCAnNGMnLCAnNGQnLCAnNGUnLCAnNGYnLCAnNTAnLCAnNTEnLCAnNTInLCAnNTMnLCAnNTQnLCAnNTUnLCAnNTYnLCAnNTcnLCAnNTgnLCAnNTknLCAnNWEnLCAnNWInLCAnNWMnLCAnNWQnLCAnNWUnLCAnNWYnLCAnNjAnLCAnNjEnLCAnNjInLCAnNjMnLCAnNjQnLCAnNjUnLCAnNjYnLCAnNjcnLCAnNjgnLCAnNjknLCAnNmEnLCAnNmInLCAnNmMnLCAnNmQnLCAnNmUnLCAnNmYnLCAnNzAnLCAnNzEnLCAnNzInLCAnNzMnLCAnNzQnLCAnNzUnLCAnNzYnLCAnNzcnLCAnNzgnLCAnNzknLCAnN2EnLCAnN2InLCAnN2MnLCAnN2QnLCAnN2UnLCAnN2YnLCAnODAnLCAnODEnLCAnODInLCAnODMnLCAnODQnLCAnODUnLCAnODYnLCAnODcnLCAnODgnLCAnODknLCAnOGEnLCAnOGInLCAnOGMnLCAnOGQnLCAnOGUnLCAnOGYnLCAnOTAnLCAnOTEnLCAnOTInLCAnOTMnLCAnOTQnLCAnOTUnLCAnOTYnLCAnOTcnLCAnOTgnLCAnOTknLCAnOWEnLCAnOWInLCAnOWMnLCAnOWQnLCAnOWUnLCAnOWYnLCAnYTAnLCAnYTEnLCAnYTInLCAnYTMnLCAnYTQnLCAnYTUnLCAnYTYnLCAnYTcnLCAnYTgnLCAnYTknLCAnYWEnLCAnYWInLCAnYWMnLCAnYWQnLCAnYWUnLCAnYWYnLCAnYjAnLCAnYjEnLCAnYjInLCAnYjMnLCAnYjQnLCAnYjUnLCAnYjYnLCAnYjcnLCAnYjgnLCAnYjknLCAnYmEnLCAnYmInLCAnYmMnLCAnYmQnLCAnYmUnLCAnYmYnLCAnYzAnLCAnYzEnLCAnYzInLCAnYzMnLCAnYzQnLCAnYzUnLCAnYzYnLCAnYzcnLCAnYzgnLCAnYzknLCAnY2EnLCAnY2InLCAnY2MnLCAnY2QnLCAnY2UnLCAnY2YnLCAnZDAnLCAnZDEnLCAnZDInLCAnZDMnLCAnZDQnLCAnZDUnLCAnZDYnLCAnZDcnLCAnZDgnLCAnZDknLCAnZGEnLCAnZGInLCAnZGMnLCAnZGQnLCAnZGUnLCAnZGYnLCAnZTAnLCAnZTEnLCAnZTInLCAnZTMnLCAnZTQnLCAnZTUnLCAnZTYnLCAnZTcnLCAnZTgnLCAnZTknLCAnZWEnLCAnZWInLCAnZWMnLCAnZWQnLCAnZWUnLCAnZWYnLCAnZjAnLCAnZjEnLCAnZjInLCAnZjMnLCAnZjQnLCAnZjUnLCAnZjYnLCAnZjcnLCAnZjgnLCAnZjknLCAnZmEnLCAnZmInLCAnZmMnLCAnZmQnLCAnZmUnLCAnZmYnIF07XG5cbmxldCBfc2VlZCA9IDEyMzQ1Njc7XG5cblxuY29uc3QgREVHMlJBRCA9IE1hdGguUEkgLyAxODA7XG5jb25zdCBSQUQyREVHID0gMTgwIC8gTWF0aC5QSTtcblxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDUwMzQvaG93LXRvLWNyZWF0ZS1hLWd1aWQtdXVpZC1pbi1qYXZhc2NyaXB0LzIxOTYzMTM2IzIxOTYzMTM2XG5mdW5jdGlvbiBnZW5lcmF0ZVVVSUQoKSB7XG5cblx0Y29uc3QgZDAgPSBNYXRoLnJhbmRvbSgpICogMHhmZmZmZmZmZiB8IDA7XG5cdGNvbnN0IGQxID0gTWF0aC5yYW5kb20oKSAqIDB4ZmZmZmZmZmYgfCAwO1xuXHRjb25zdCBkMiA9IE1hdGgucmFuZG9tKCkgKiAweGZmZmZmZmZmIHwgMDtcblx0Y29uc3QgZDMgPSBNYXRoLnJhbmRvbSgpICogMHhmZmZmZmZmZiB8IDA7XG5cdGNvbnN0IHV1aWQgPSBfbHV0WyBkMCAmIDB4ZmYgXSArIF9sdXRbIGQwID4+IDggJiAweGZmIF0gKyBfbHV0WyBkMCA+PiAxNiAmIDB4ZmYgXSArIF9sdXRbIGQwID4+IDI0ICYgMHhmZiBdICsgJy0nICtcblx0XHRcdF9sdXRbIGQxICYgMHhmZiBdICsgX2x1dFsgZDEgPj4gOCAmIDB4ZmYgXSArICctJyArIF9sdXRbIGQxID4+IDE2ICYgMHgwZiB8IDB4NDAgXSArIF9sdXRbIGQxID4+IDI0ICYgMHhmZiBdICsgJy0nICtcblx0XHRcdF9sdXRbIGQyICYgMHgzZiB8IDB4ODAgXSArIF9sdXRbIGQyID4+IDggJiAweGZmIF0gKyAnLScgKyBfbHV0WyBkMiA+PiAxNiAmIDB4ZmYgXSArIF9sdXRbIGQyID4+IDI0ICYgMHhmZiBdICtcblx0XHRcdF9sdXRbIGQzICYgMHhmZiBdICsgX2x1dFsgZDMgPj4gOCAmIDB4ZmYgXSArIF9sdXRbIGQzID4+IDE2ICYgMHhmZiBdICsgX2x1dFsgZDMgPj4gMjQgJiAweGZmIF07XG5cblx0Ly8gLnRvTG93ZXJDYXNlKCkgaGVyZSBmbGF0dGVucyBjb25jYXRlbmF0ZWQgc3RyaW5ncyB0byBzYXZlIGhlYXAgbWVtb3J5IHNwYWNlLlxuXHRyZXR1cm4gdXVpZC50b0xvd2VyQ2FzZSgpO1xuXG59XG5cbmZ1bmN0aW9uIGNsYW1wKCB2YWx1ZSwgbWluLCBtYXggKSB7XG5cblx0cmV0dXJuIE1hdGgubWF4KCBtaW4sIE1hdGgubWluKCBtYXgsIHZhbHVlICkgKTtcblxufVxuXG4vLyBjb21wdXRlIGV1Y2xpZGVhbiBtb2R1bG8gb2YgbSAlIG5cbi8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01vZHVsb19vcGVyYXRpb25cbmZ1bmN0aW9uIGV1Y2xpZGVhbk1vZHVsbyggbiwgbSApIHtcblxuXHRyZXR1cm4gKCAoIG4gJSBtICkgKyBtICkgJSBtO1xuXG59XG5cbi8vIExpbmVhciBtYXBwaW5nIGZyb20gcmFuZ2UgPGExLCBhMj4gdG8gcmFuZ2UgPGIxLCBiMj5cbmZ1bmN0aW9uIG1hcExpbmVhciggeCwgYTEsIGEyLCBiMSwgYjIgKSB7XG5cblx0cmV0dXJuIGIxICsgKCB4IC0gYTEgKSAqICggYjIgLSBiMSApIC8gKCBhMiAtIGExICk7XG5cbn1cblxuLy8gaHR0cHM6Ly93d3cuZ2FtZWRldi5uZXQvdHV0b3JpYWxzL3Byb2dyYW1taW5nL2dlbmVyYWwtYW5kLWdhbWVwbGF5LXByb2dyYW1taW5nL2ludmVyc2UtbGVycC1hLXN1cGVyLXVzZWZ1bC15ZXQtb2Z0ZW4tb3Zlcmxvb2tlZC1mdW5jdGlvbi1yNTIzMC9cbmZ1bmN0aW9uIGludmVyc2VMZXJwKCB4LCB5LCB2YWx1ZSApIHtcblxuXHRpZiAoIHggIT09IHkgKSB7XG5cblx0XHRyZXR1cm4gKCB2YWx1ZSAtIHggKSAvICggeSAtIHggKTtcblxuXHR9IGVsc2Uge1xuXG5cdFx0cmV0dXJuIDA7XG5cblx0fVxuXG59XG5cbi8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpbmVhcl9pbnRlcnBvbGF0aW9uXG5mdW5jdGlvbiBsZXJwKCB4LCB5LCB0ICkge1xuXG5cdHJldHVybiAoIDEgLSB0ICkgKiB4ICsgdCAqIHk7XG5cbn1cblxuLy8gaHR0cDovL3d3dy5yb3J5ZHJpc2NvbGwuY29tLzIwMTYvMDMvMDcvZnJhbWUtcmF0ZS1pbmRlcGVuZGVudC1kYW1waW5nLXVzaW5nLWxlcnAvXG5mdW5jdGlvbiBkYW1wKCB4LCB5LCBsYW1iZGEsIGR0ICkge1xuXG5cdHJldHVybiBsZXJwKCB4LCB5LCAxIC0gTWF0aC5leHAoIC0gbGFtYmRhICogZHQgKSApO1xuXG59XG5cbi8vIGh0dHBzOi8vd3d3LmRlc21vcy5jb20vY2FsY3VsYXRvci92Y3Nqbnl6N3g0XG5mdW5jdGlvbiBwaW5ncG9uZyggeCwgbGVuZ3RoID0gMSApIHtcblxuXHRyZXR1cm4gbGVuZ3RoIC0gTWF0aC5hYnMoIGV1Y2xpZGVhbk1vZHVsbyggeCwgbGVuZ3RoICogMiApIC0gbGVuZ3RoICk7XG5cbn1cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TbW9vdGhzdGVwXG5mdW5jdGlvbiBzbW9vdGhzdGVwKCB4LCBtaW4sIG1heCApIHtcblxuXHRpZiAoIHggPD0gbWluICkgcmV0dXJuIDA7XG5cdGlmICggeCA+PSBtYXggKSByZXR1cm4gMTtcblxuXHR4ID0gKCB4IC0gbWluICkgLyAoIG1heCAtIG1pbiApO1xuXG5cdHJldHVybiB4ICogeCAqICggMyAtIDIgKiB4ICk7XG5cbn1cblxuZnVuY3Rpb24gc21vb3RoZXJzdGVwKCB4LCBtaW4sIG1heCApIHtcblxuXHRpZiAoIHggPD0gbWluICkgcmV0dXJuIDA7XG5cdGlmICggeCA+PSBtYXggKSByZXR1cm4gMTtcblxuXHR4ID0gKCB4IC0gbWluICkgLyAoIG1heCAtIG1pbiApO1xuXG5cdHJldHVybiB4ICogeCAqIHggKiAoIHggKiAoIHggKiA2IC0gMTUgKSArIDEwICk7XG5cbn1cblxuLy8gUmFuZG9tIGludGVnZXIgZnJvbSA8bG93LCBoaWdoPiBpbnRlcnZhbFxuZnVuY3Rpb24gcmFuZEludCggbG93LCBoaWdoICkge1xuXG5cdHJldHVybiBsb3cgKyBNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogKCBoaWdoIC0gbG93ICsgMSApICk7XG5cbn1cblxuLy8gUmFuZG9tIGZsb2F0IGZyb20gPGxvdywgaGlnaD4gaW50ZXJ2YWxcbmZ1bmN0aW9uIHJhbmRGbG9hdCggbG93LCBoaWdoICkge1xuXG5cdHJldHVybiBsb3cgKyBNYXRoLnJhbmRvbSgpICogKCBoaWdoIC0gbG93ICk7XG5cbn1cblxuLy8gUmFuZG9tIGZsb2F0IGZyb20gPC1yYW5nZS8yLCByYW5nZS8yPiBpbnRlcnZhbFxuZnVuY3Rpb24gcmFuZEZsb2F0U3ByZWFkKCByYW5nZSApIHtcblxuXHRyZXR1cm4gcmFuZ2UgKiAoIDAuNSAtIE1hdGgucmFuZG9tKCkgKTtcblxufVxuXG4vLyBEZXRlcm1pbmlzdGljIHBzZXVkby1yYW5kb20gZmxvYXQgaW4gdGhlIGludGVydmFsIFsgMCwgMSBdXG5mdW5jdGlvbiBzZWVkZWRSYW5kb20oIHMgKSB7XG5cblx0aWYgKCBzICE9PSB1bmRlZmluZWQgKSBfc2VlZCA9IHM7XG5cblx0Ly8gTXVsYmVycnkzMiBnZW5lcmF0b3JcblxuXHRsZXQgdCA9IF9zZWVkICs9IDB4NkQyQjc5RjU7XG5cblx0dCA9IE1hdGguaW11bCggdCBeIHQgPj4+IDE1LCB0IHwgMSApO1xuXG5cdHQgXj0gdCArIE1hdGguaW11bCggdCBeIHQgPj4+IDcsIHQgfCA2MSApO1xuXG5cdHJldHVybiAoICggdCBeIHQgPj4+IDE0ICkgPj4+IDAgKSAvIDQyOTQ5NjcyOTY7XG5cbn1cblxuZnVuY3Rpb24gZGVnVG9SYWQoIGRlZ3JlZXMgKSB7XG5cblx0cmV0dXJuIGRlZ3JlZXMgKiBERUcyUkFEO1xuXG59XG5cbmZ1bmN0aW9uIHJhZFRvRGVnKCByYWRpYW5zICkge1xuXG5cdHJldHVybiByYWRpYW5zICogUkFEMkRFRztcblxufVxuXG5mdW5jdGlvbiBpc1Bvd2VyT2ZUd28oIHZhbHVlICkge1xuXG5cdHJldHVybiAoIHZhbHVlICYgKCB2YWx1ZSAtIDEgKSApID09PSAwICYmIHZhbHVlICE9PSAwO1xuXG59XG5cbmZ1bmN0aW9uIGNlaWxQb3dlck9mVHdvKCB2YWx1ZSApIHtcblxuXHRyZXR1cm4gTWF0aC5wb3coIDIsIE1hdGguY2VpbCggTWF0aC5sb2coIHZhbHVlICkgLyBNYXRoLkxOMiApICk7XG5cbn1cblxuZnVuY3Rpb24gZmxvb3JQb3dlck9mVHdvKCB2YWx1ZSApIHtcblxuXHRyZXR1cm4gTWF0aC5wb3coIDIsIE1hdGguZmxvb3IoIE1hdGgubG9nKCB2YWx1ZSApIC8gTWF0aC5MTjIgKSApO1xuXG59XG5cbmZ1bmN0aW9uIHNldFF1YXRlcm5pb25Gcm9tUHJvcGVyRXVsZXIoIHEsIGEsIGIsIGMsIG9yZGVyICkge1xuXG5cdC8vIEludHJpbnNpYyBQcm9wZXIgRXVsZXIgQW5nbGVzIC0gc2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0V1bGVyX2FuZ2xlc1xuXG5cdC8vIHJvdGF0aW9ucyBhcmUgYXBwbGllZCB0byB0aGUgYXhlcyBpbiB0aGUgb3JkZXIgc3BlY2lmaWVkIGJ5ICdvcmRlcidcblx0Ly8gcm90YXRpb24gYnkgYW5nbGUgJ2EnIGlzIGFwcGxpZWQgZmlyc3QsIHRoZW4gYnkgYW5nbGUgJ2InLCB0aGVuIGJ5IGFuZ2xlICdjJ1xuXHQvLyBhbmdsZXMgYXJlIGluIHJhZGlhbnNcblxuXHRjb25zdCBjb3MgPSBNYXRoLmNvcztcblx0Y29uc3Qgc2luID0gTWF0aC5zaW47XG5cblx0Y29uc3QgYzIgPSBjb3MoIGIgLyAyICk7XG5cdGNvbnN0IHMyID0gc2luKCBiIC8gMiApO1xuXG5cdGNvbnN0IGMxMyA9IGNvcyggKCBhICsgYyApIC8gMiApO1xuXHRjb25zdCBzMTMgPSBzaW4oICggYSArIGMgKSAvIDIgKTtcblxuXHRjb25zdCBjMV8zID0gY29zKCAoIGEgLSBjICkgLyAyICk7XG5cdGNvbnN0IHMxXzMgPSBzaW4oICggYSAtIGMgKSAvIDIgKTtcblxuXHRjb25zdCBjM18xID0gY29zKCAoIGMgLSBhICkgLyAyICk7XG5cdGNvbnN0IHMzXzEgPSBzaW4oICggYyAtIGEgKSAvIDIgKTtcblxuXHRzd2l0Y2ggKCBvcmRlciApIHtcblxuXHRcdGNhc2UgJ1hZWCc6XG5cdFx0XHRxLnNldCggYzIgKiBzMTMsIHMyICogYzFfMywgczIgKiBzMV8zLCBjMiAqIGMxMyApO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlICdZWlknOlxuXHRcdFx0cS5zZXQoIHMyICogczFfMywgYzIgKiBzMTMsIHMyICogYzFfMywgYzIgKiBjMTMgKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSAnWlhaJzpcblx0XHRcdHEuc2V0KCBzMiAqIGMxXzMsIHMyICogczFfMywgYzIgKiBzMTMsIGMyICogYzEzICk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgJ1haWCc6XG5cdFx0XHRxLnNldCggYzIgKiBzMTMsIHMyICogczNfMSwgczIgKiBjM18xLCBjMiAqIGMxMyApO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlICdZWFknOlxuXHRcdFx0cS5zZXQoIHMyICogYzNfMSwgYzIgKiBzMTMsIHMyICogczNfMSwgYzIgKiBjMTMgKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSAnWllaJzpcblx0XHRcdHEuc2V0KCBzMiAqIHMzXzEsIHMyICogYzNfMSwgYzIgKiBzMTMsIGMyICogYzEzICk7XG5cdFx0XHRicmVhaztcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5NYXRoVXRpbHM6IC5zZXRRdWF0ZXJuaW9uRnJvbVByb3BlckV1bGVyKCkgZW5jb3VudGVyZWQgYW4gdW5rbm93biBvcmRlcjogJyArIG9yZGVyICk7XG5cblx0fVxuXG59XG5cbmZ1bmN0aW9uIGRlbm9ybWFsaXplKCB2YWx1ZSwgYXJyYXkgKSB7XG5cblx0c3dpdGNoICggYXJyYXkuY29uc3RydWN0b3IgKSB7XG5cblx0XHRjYXNlIEZsb2F0MzJBcnJheTpcblxuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXG5cdFx0Y2FzZSBVaW50MzJBcnJheTpcblxuXHRcdFx0cmV0dXJuIHZhbHVlIC8gNDI5NDk2NzI5NS4wO1xuXG5cdFx0Y2FzZSBVaW50MTZBcnJheTpcblxuXHRcdFx0cmV0dXJuIHZhbHVlIC8gNjU1MzUuMDtcblxuXHRcdGNhc2UgVWludDhBcnJheTpcblxuXHRcdFx0cmV0dXJuIHZhbHVlIC8gMjU1LjA7XG5cblx0XHRjYXNlIEludDMyQXJyYXk6XG5cblx0XHRcdHJldHVybiBNYXRoLm1heCggdmFsdWUgLyAyMTQ3NDgzNjQ3LjAsIC0gMS4wICk7XG5cblx0XHRjYXNlIEludDE2QXJyYXk6XG5cblx0XHRcdHJldHVybiBNYXRoLm1heCggdmFsdWUgLyAzMjc2Ny4wLCAtIDEuMCApO1xuXG5cdFx0Y2FzZSBJbnQ4QXJyYXk6XG5cblx0XHRcdHJldHVybiBNYXRoLm1heCggdmFsdWUgLyAxMjcuMCwgLSAxLjAgKTtcblxuXHRcdGRlZmF1bHQ6XG5cblx0XHRcdHRocm93IG5ldyBFcnJvciggJ0ludmFsaWQgY29tcG9uZW50IHR5cGUuJyApO1xuXG5cdH1cblxufVxuXG5mdW5jdGlvbiBub3JtYWxpemUoIHZhbHVlLCBhcnJheSApIHtcblxuXHRzd2l0Y2ggKCBhcnJheS5jb25zdHJ1Y3RvciApIHtcblxuXHRcdGNhc2UgRmxvYXQzMkFycmF5OlxuXG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cblx0XHRjYXNlIFVpbnQzMkFycmF5OlxuXG5cdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCggdmFsdWUgKiA0Mjk0OTY3Mjk1LjAgKTtcblxuXHRcdGNhc2UgVWludDE2QXJyYXk6XG5cblx0XHRcdHJldHVybiBNYXRoLnJvdW5kKCB2YWx1ZSAqIDY1NTM1LjAgKTtcblxuXHRcdGNhc2UgVWludDhBcnJheTpcblxuXHRcdFx0cmV0dXJuIE1hdGgucm91bmQoIHZhbHVlICogMjU1LjAgKTtcblxuXHRcdGNhc2UgSW50MzJBcnJheTpcblxuXHRcdFx0cmV0dXJuIE1hdGgucm91bmQoIHZhbHVlICogMjE0NzQ4MzY0Ny4wICk7XG5cblx0XHRjYXNlIEludDE2QXJyYXk6XG5cblx0XHRcdHJldHVybiBNYXRoLnJvdW5kKCB2YWx1ZSAqIDMyNzY3LjAgKTtcblxuXHRcdGNhc2UgSW50OEFycmF5OlxuXG5cdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCggdmFsdWUgKiAxMjcuMCApO1xuXG5cdFx0ZGVmYXVsdDpcblxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCAnSW52YWxpZCBjb21wb25lbnQgdHlwZS4nICk7XG5cblx0fVxuXG59XG5cbmNvbnN0IE1hdGhVdGlscyA9IHtcblx0REVHMlJBRDogREVHMlJBRCxcblx0UkFEMkRFRzogUkFEMkRFRyxcblx0Z2VuZXJhdGVVVUlEOiBnZW5lcmF0ZVVVSUQsXG5cdGNsYW1wOiBjbGFtcCxcblx0ZXVjbGlkZWFuTW9kdWxvOiBldWNsaWRlYW5Nb2R1bG8sXG5cdG1hcExpbmVhcjogbWFwTGluZWFyLFxuXHRpbnZlcnNlTGVycDogaW52ZXJzZUxlcnAsXG5cdGxlcnA6IGxlcnAsXG5cdGRhbXA6IGRhbXAsXG5cdHBpbmdwb25nOiBwaW5ncG9uZyxcblx0c21vb3Roc3RlcDogc21vb3Roc3RlcCxcblx0c21vb3RoZXJzdGVwOiBzbW9vdGhlcnN0ZXAsXG5cdHJhbmRJbnQ6IHJhbmRJbnQsXG5cdHJhbmRGbG9hdDogcmFuZEZsb2F0LFxuXHRyYW5kRmxvYXRTcHJlYWQ6IHJhbmRGbG9hdFNwcmVhZCxcblx0c2VlZGVkUmFuZG9tOiBzZWVkZWRSYW5kb20sXG5cdGRlZ1RvUmFkOiBkZWdUb1JhZCxcblx0cmFkVG9EZWc6IHJhZFRvRGVnLFxuXHRpc1Bvd2VyT2ZUd286IGlzUG93ZXJPZlR3byxcblx0Y2VpbFBvd2VyT2ZUd286IGNlaWxQb3dlck9mVHdvLFxuXHRmbG9vclBvd2VyT2ZUd286IGZsb29yUG93ZXJPZlR3byxcblx0c2V0UXVhdGVybmlvbkZyb21Qcm9wZXJFdWxlcjogc2V0UXVhdGVybmlvbkZyb21Qcm9wZXJFdWxlcixcblx0bm9ybWFsaXplOiBub3JtYWxpemUsXG5cdGRlbm9ybWFsaXplOiBkZW5vcm1hbGl6ZVxufTtcblxuZXhwb3J0IHtcblx0REVHMlJBRCxcblx0UkFEMkRFRyxcblx0Z2VuZXJhdGVVVUlELFxuXHRjbGFtcCxcblx0ZXVjbGlkZWFuTW9kdWxvLFxuXHRtYXBMaW5lYXIsXG5cdGludmVyc2VMZXJwLFxuXHRsZXJwLFxuXHRkYW1wLFxuXHRwaW5ncG9uZyxcblx0c21vb3Roc3RlcCxcblx0c21vb3RoZXJzdGVwLFxuXHRyYW5kSW50LFxuXHRyYW5kRmxvYXQsXG5cdHJhbmRGbG9hdFNwcmVhZCxcblx0c2VlZGVkUmFuZG9tLFxuXHRkZWdUb1JhZCxcblx0cmFkVG9EZWcsXG5cdGlzUG93ZXJPZlR3byxcblx0Y2VpbFBvd2VyT2ZUd28sXG5cdGZsb29yUG93ZXJPZlR3byxcblx0c2V0UXVhdGVybmlvbkZyb21Qcm9wZXJFdWxlcixcblx0bm9ybWFsaXplLFxuXHRkZW5vcm1hbGl6ZSxcblx0TWF0aFV0aWxzXG59O1xuIiwiaW1wb3J0ICogYXMgTWF0aFV0aWxzIGZyb20gJy4vTWF0aFV0aWxzLmpzJztcblxuY2xhc3MgVmVjdG9yMiB7XG5cblx0Y29uc3RydWN0b3IoIHggPSAwLCB5ID0gMCApIHtcblxuXHRcdFZlY3RvcjIucHJvdG90eXBlLmlzVmVjdG9yMiA9IHRydWU7XG5cblx0XHR0aGlzLnggPSB4O1xuXHRcdHRoaXMueSA9IHk7XG5cblx0fVxuXG5cdGdldCB3aWR0aCgpIHtcblxuXHRcdHJldHVybiB0aGlzLng7XG5cblx0fVxuXG5cdHNldCB3aWR0aCggdmFsdWUgKSB7XG5cblx0XHR0aGlzLnggPSB2YWx1ZTtcblxuXHR9XG5cblx0Z2V0IGhlaWdodCgpIHtcblxuXHRcdHJldHVybiB0aGlzLnk7XG5cblx0fVxuXG5cdHNldCBoZWlnaHQoIHZhbHVlICkge1xuXG5cdFx0dGhpcy55ID0gdmFsdWU7XG5cblx0fVxuXG5cdHNldCggeCwgeSApIHtcblxuXHRcdHRoaXMueCA9IHg7XG5cdFx0dGhpcy55ID0geTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRTY2FsYXIoIHNjYWxhciApIHtcblxuXHRcdHRoaXMueCA9IHNjYWxhcjtcblx0XHR0aGlzLnkgPSBzY2FsYXI7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0WCggeCApIHtcblxuXHRcdHRoaXMueCA9IHg7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0WSggeSApIHtcblxuXHRcdHRoaXMueSA9IHk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0Q29tcG9uZW50KCBpbmRleCwgdmFsdWUgKSB7XG5cblx0XHRzd2l0Y2ggKCBpbmRleCApIHtcblxuXHRcdFx0Y2FzZSAwOiB0aGlzLnggPSB2YWx1ZTsgYnJlYWs7XG5cdFx0XHRjYXNlIDE6IHRoaXMueSA9IHZhbHVlOyBicmVhaztcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvciggJ2luZGV4IGlzIG91dCBvZiByYW5nZTogJyArIGluZGV4ICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Z2V0Q29tcG9uZW50KCBpbmRleCApIHtcblxuXHRcdHN3aXRjaCAoIGluZGV4ICkge1xuXG5cdFx0XHRjYXNlIDA6IHJldHVybiB0aGlzLng7XG5cdFx0XHRjYXNlIDE6IHJldHVybiB0aGlzLnk7XG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoICdpbmRleCBpcyBvdXQgb2YgcmFuZ2U6ICcgKyBpbmRleCApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRjbG9uZSgpIHtcblxuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvciggdGhpcy54LCB0aGlzLnkgKTtcblxuXHR9XG5cblx0Y29weSggdiApIHtcblxuXHRcdHRoaXMueCA9IHYueDtcblx0XHR0aGlzLnkgPSB2Lnk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0YWRkKCB2ICkge1xuXG5cdFx0dGhpcy54ICs9IHYueDtcblx0XHR0aGlzLnkgKz0gdi55O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGFkZFNjYWxhciggcyApIHtcblxuXHRcdHRoaXMueCArPSBzO1xuXHRcdHRoaXMueSArPSBzO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGFkZFZlY3RvcnMoIGEsIGIgKSB7XG5cblx0XHR0aGlzLnggPSBhLnggKyBiLng7XG5cdFx0dGhpcy55ID0gYS55ICsgYi55O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGFkZFNjYWxlZFZlY3RvciggdiwgcyApIHtcblxuXHRcdHRoaXMueCArPSB2LnggKiBzO1xuXHRcdHRoaXMueSArPSB2LnkgKiBzO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHN1YiggdiApIHtcblxuXHRcdHRoaXMueCAtPSB2Lng7XG5cdFx0dGhpcy55IC09IHYueTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzdWJTY2FsYXIoIHMgKSB7XG5cblx0XHR0aGlzLnggLT0gcztcblx0XHR0aGlzLnkgLT0gcztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzdWJWZWN0b3JzKCBhLCBiICkge1xuXG5cdFx0dGhpcy54ID0gYS54IC0gYi54O1xuXHRcdHRoaXMueSA9IGEueSAtIGIueTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRtdWx0aXBseSggdiApIHtcblxuXHRcdHRoaXMueCAqPSB2Lng7XG5cdFx0dGhpcy55ICo9IHYueTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRtdWx0aXBseVNjYWxhciggc2NhbGFyICkge1xuXG5cdFx0dGhpcy54ICo9IHNjYWxhcjtcblx0XHR0aGlzLnkgKj0gc2NhbGFyO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGRpdmlkZSggdiApIHtcblxuXHRcdHRoaXMueCAvPSB2Lng7XG5cdFx0dGhpcy55IC89IHYueTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRkaXZpZGVTY2FsYXIoIHNjYWxhciApIHtcblxuXHRcdHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKCAxIC8gc2NhbGFyICk7XG5cblx0fVxuXG5cdGFwcGx5TWF0cml4MyggbSApIHtcblxuXHRcdGNvbnN0IHggPSB0aGlzLngsIHkgPSB0aGlzLnk7XG5cdFx0Y29uc3QgZSA9IG0uZWxlbWVudHM7XG5cblx0XHR0aGlzLnggPSBlWyAwIF0gKiB4ICsgZVsgMyBdICogeSArIGVbIDYgXTtcblx0XHR0aGlzLnkgPSBlWyAxIF0gKiB4ICsgZVsgNCBdICogeSArIGVbIDcgXTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRtaW4oIHYgKSB7XG5cblx0XHR0aGlzLnggPSBNYXRoLm1pbiggdGhpcy54LCB2LnggKTtcblx0XHR0aGlzLnkgPSBNYXRoLm1pbiggdGhpcy55LCB2LnkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRtYXgoIHYgKSB7XG5cblx0XHR0aGlzLnggPSBNYXRoLm1heCggdGhpcy54LCB2LnggKTtcblx0XHR0aGlzLnkgPSBNYXRoLm1heCggdGhpcy55LCB2LnkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjbGFtcCggbWluLCBtYXggKSB7XG5cblx0XHQvLyBhc3N1bWVzIG1pbiA8IG1heCwgY29tcG9uZW50d2lzZVxuXG5cdFx0dGhpcy54ID0gTWF0aC5tYXgoIG1pbi54LCBNYXRoLm1pbiggbWF4LngsIHRoaXMueCApICk7XG5cdFx0dGhpcy55ID0gTWF0aC5tYXgoIG1pbi55LCBNYXRoLm1pbiggbWF4LnksIHRoaXMueSApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y2xhbXBTY2FsYXIoIG1pblZhbCwgbWF4VmFsICkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5tYXgoIG1pblZhbCwgTWF0aC5taW4oIG1heFZhbCwgdGhpcy54ICkgKTtcblx0XHR0aGlzLnkgPSBNYXRoLm1heCggbWluVmFsLCBNYXRoLm1pbiggbWF4VmFsLCB0aGlzLnkgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNsYW1wTGVuZ3RoKCBtaW4sIG1heCApIHtcblxuXHRcdGNvbnN0IGxlbmd0aCA9IHRoaXMubGVuZ3RoKCk7XG5cblx0XHRyZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIoIGxlbmd0aCB8fCAxICkubXVsdGlwbHlTY2FsYXIoIE1hdGgubWF4KCBtaW4sIE1hdGgubWluKCBtYXgsIGxlbmd0aCApICkgKTtcblxuXHR9XG5cblx0Zmxvb3IoKSB7XG5cblx0XHR0aGlzLnggPSBNYXRoLmZsb29yKCB0aGlzLnggKTtcblx0XHR0aGlzLnkgPSBNYXRoLmZsb29yKCB0aGlzLnkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjZWlsKCkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5jZWlsKCB0aGlzLnggKTtcblx0XHR0aGlzLnkgPSBNYXRoLmNlaWwoIHRoaXMueSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHJvdW5kKCkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5yb3VuZCggdGhpcy54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5yb3VuZCggdGhpcy55ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0cm91bmRUb1plcm8oKSB7XG5cblx0XHR0aGlzLnggPSAoIHRoaXMueCA8IDAgKSA/IE1hdGguY2VpbCggdGhpcy54ICkgOiBNYXRoLmZsb29yKCB0aGlzLnggKTtcblx0XHR0aGlzLnkgPSAoIHRoaXMueSA8IDAgKSA/IE1hdGguY2VpbCggdGhpcy55ICkgOiBNYXRoLmZsb29yKCB0aGlzLnkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRuZWdhdGUoKSB7XG5cblx0XHR0aGlzLnggPSAtIHRoaXMueDtcblx0XHR0aGlzLnkgPSAtIHRoaXMueTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRkb3QoIHYgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55O1xuXG5cdH1cblxuXHRjcm9zcyggdiApIHtcblxuXHRcdHJldHVybiB0aGlzLnggKiB2LnkgLSB0aGlzLnkgKiB2Lng7XG5cblx0fVxuXG5cdGxlbmd0aFNxKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueTtcblxuXHR9XG5cblx0bGVuZ3RoKCkge1xuXG5cdFx0cmV0dXJuIE1hdGguc3FydCggdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICk7XG5cblx0fVxuXG5cdG1hbmhhdHRhbkxlbmd0aCgpIHtcblxuXHRcdHJldHVybiBNYXRoLmFicyggdGhpcy54ICkgKyBNYXRoLmFicyggdGhpcy55ICk7XG5cblx0fVxuXG5cdG5vcm1hbGl6ZSgpIHtcblxuXHRcdHJldHVybiB0aGlzLmRpdmlkZVNjYWxhciggdGhpcy5sZW5ndGgoKSB8fCAxICk7XG5cblx0fVxuXG5cdGFuZ2xlKCkge1xuXG5cdFx0Ly8gY29tcHV0ZXMgdGhlIGFuZ2xlIGluIHJhZGlhbnMgd2l0aCByZXNwZWN0IHRvIHRoZSBwb3NpdGl2ZSB4LWF4aXNcblxuXHRcdGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMiggLSB0aGlzLnksIC0gdGhpcy54ICkgKyBNYXRoLlBJO1xuXG5cdFx0cmV0dXJuIGFuZ2xlO1xuXG5cdH1cblxuXHRhbmdsZVRvKCB2ICkge1xuXG5cdFx0Y29uc3QgZGVub21pbmF0b3IgPSBNYXRoLnNxcnQoIHRoaXMubGVuZ3RoU3EoKSAqIHYubGVuZ3RoU3EoKSApO1xuXG5cdFx0aWYgKCBkZW5vbWluYXRvciA9PT0gMCApIHJldHVybiBNYXRoLlBJIC8gMjtcblxuXHRcdGNvbnN0IHRoZXRhID0gdGhpcy5kb3QoIHYgKSAvIGRlbm9taW5hdG9yO1xuXG5cdFx0Ly8gY2xhbXAsIHRvIGhhbmRsZSBudW1lcmljYWwgcHJvYmxlbXNcblxuXHRcdHJldHVybiBNYXRoLmFjb3MoIE1hdGhVdGlscy5jbGFtcCggdGhldGEsIC0gMSwgMSApICk7XG5cblx0fVxuXG5cdGRpc3RhbmNlVG8oIHYgKSB7XG5cblx0XHRyZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLmRpc3RhbmNlVG9TcXVhcmVkKCB2ICkgKTtcblxuXHR9XG5cblx0ZGlzdGFuY2VUb1NxdWFyZWQoIHYgKSB7XG5cblx0XHRjb25zdCBkeCA9IHRoaXMueCAtIHYueCwgZHkgPSB0aGlzLnkgLSB2Lnk7XG5cdFx0cmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xuXG5cdH1cblxuXHRtYW5oYXR0YW5EaXN0YW5jZVRvKCB2ICkge1xuXG5cdFx0cmV0dXJuIE1hdGguYWJzKCB0aGlzLnggLSB2LnggKSArIE1hdGguYWJzKCB0aGlzLnkgLSB2LnkgKTtcblxuXHR9XG5cblx0c2V0TGVuZ3RoKCBsZW5ndGggKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5ub3JtYWxpemUoKS5tdWx0aXBseVNjYWxhciggbGVuZ3RoICk7XG5cblx0fVxuXG5cdGxlcnAoIHYsIGFscGhhICkge1xuXG5cdFx0dGhpcy54ICs9ICggdi54IC0gdGhpcy54ICkgKiBhbHBoYTtcblx0XHR0aGlzLnkgKz0gKCB2LnkgLSB0aGlzLnkgKSAqIGFscGhhO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGxlcnBWZWN0b3JzKCB2MSwgdjIsIGFscGhhICkge1xuXG5cdFx0dGhpcy54ID0gdjEueCArICggdjIueCAtIHYxLnggKSAqIGFscGhhO1xuXHRcdHRoaXMueSA9IHYxLnkgKyAoIHYyLnkgLSB2MS55ICkgKiBhbHBoYTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRlcXVhbHMoIHYgKSB7XG5cblx0XHRyZXR1cm4gKCAoIHYueCA9PT0gdGhpcy54ICkgJiYgKCB2LnkgPT09IHRoaXMueSApICk7XG5cblx0fVxuXG5cdGZyb21BcnJheSggYXJyYXksIG9mZnNldCA9IDAgKSB7XG5cblx0XHR0aGlzLnggPSBhcnJheVsgb2Zmc2V0IF07XG5cdFx0dGhpcy55ID0gYXJyYXlbIG9mZnNldCArIDEgXTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR0b0FycmF5KCBhcnJheSA9IFtdLCBvZmZzZXQgPSAwICkge1xuXG5cdFx0YXJyYXlbIG9mZnNldCBdID0gdGhpcy54O1xuXHRcdGFycmF5WyBvZmZzZXQgKyAxIF0gPSB0aGlzLnk7XG5cblx0XHRyZXR1cm4gYXJyYXk7XG5cblx0fVxuXG5cdGZyb21CdWZmZXJBdHRyaWJ1dGUoIGF0dHJpYnV0ZSwgaW5kZXggKSB7XG5cblx0XHR0aGlzLnggPSBhdHRyaWJ1dGUuZ2V0WCggaW5kZXggKTtcblx0XHR0aGlzLnkgPSBhdHRyaWJ1dGUuZ2V0WSggaW5kZXggKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRyb3RhdGVBcm91bmQoIGNlbnRlciwgYW5nbGUgKSB7XG5cblx0XHRjb25zdCBjID0gTWF0aC5jb3MoIGFuZ2xlICksIHMgPSBNYXRoLnNpbiggYW5nbGUgKTtcblxuXHRcdGNvbnN0IHggPSB0aGlzLnggLSBjZW50ZXIueDtcblx0XHRjb25zdCB5ID0gdGhpcy55IC0gY2VudGVyLnk7XG5cblx0XHR0aGlzLnggPSB4ICogYyAtIHkgKiBzICsgY2VudGVyLng7XG5cdFx0dGhpcy55ID0geCAqIHMgKyB5ICogYyArIGNlbnRlci55O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHJhbmRvbSgpIHtcblxuXHRcdHRoaXMueCA9IE1hdGgucmFuZG9tKCk7XG5cdFx0dGhpcy55ID0gTWF0aC5yYW5kb20oKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQqWyBTeW1ib2wuaXRlcmF0b3IgXSgpIHtcblxuXHRcdHlpZWxkIHRoaXMueDtcblx0XHR5aWVsZCB0aGlzLnk7XG5cblx0fVxuXG59XG5cbmV4cG9ydCB7IFZlY3RvcjIgfTtcbiIsImNsYXNzIE1hdHJpeDMge1xuXG5cdGNvbnN0cnVjdG9yKCBuMTEsIG4xMiwgbjEzLCBuMjEsIG4yMiwgbjIzLCBuMzEsIG4zMiwgbjMzICkge1xuXG5cdFx0TWF0cml4My5wcm90b3R5cGUuaXNNYXRyaXgzID0gdHJ1ZTtcblxuXHRcdHRoaXMuZWxlbWVudHMgPSBbXG5cblx0XHRcdDEsIDAsIDAsXG5cdFx0XHQwLCAxLCAwLFxuXHRcdFx0MCwgMCwgMVxuXG5cdFx0XTtcblxuXHRcdGlmICggbjExICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHRoaXMuc2V0KCBuMTEsIG4xMiwgbjEzLCBuMjEsIG4yMiwgbjIzLCBuMzEsIG4zMiwgbjMzICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdHNldCggbjExLCBuMTIsIG4xMywgbjIxLCBuMjIsIG4yMywgbjMxLCBuMzIsIG4zMyApIHtcblxuXHRcdGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcblxuXHRcdHRlWyAwIF0gPSBuMTE7IHRlWyAxIF0gPSBuMjE7IHRlWyAyIF0gPSBuMzE7XG5cdFx0dGVbIDMgXSA9IG4xMjsgdGVbIDQgXSA9IG4yMjsgdGVbIDUgXSA9IG4zMjtcblx0XHR0ZVsgNiBdID0gbjEzOyB0ZVsgNyBdID0gbjIzOyB0ZVsgOCBdID0gbjMzO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGlkZW50aXR5KCkge1xuXG5cdFx0dGhpcy5zZXQoXG5cblx0XHRcdDEsIDAsIDAsXG5cdFx0XHQwLCAxLCAwLFxuXHRcdFx0MCwgMCwgMVxuXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjb3B5KCBtICkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXHRcdGNvbnN0IG1lID0gbS5lbGVtZW50cztcblxuXHRcdHRlWyAwIF0gPSBtZVsgMCBdOyB0ZVsgMSBdID0gbWVbIDEgXTsgdGVbIDIgXSA9IG1lWyAyIF07XG5cdFx0dGVbIDMgXSA9IG1lWyAzIF07IHRlWyA0IF0gPSBtZVsgNCBdOyB0ZVsgNSBdID0gbWVbIDUgXTtcblx0XHR0ZVsgNiBdID0gbWVbIDYgXTsgdGVbIDcgXSA9IG1lWyA3IF07IHRlWyA4IF0gPSBtZVsgOCBdO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGV4dHJhY3RCYXNpcyggeEF4aXMsIHlBeGlzLCB6QXhpcyApIHtcblxuXHRcdHhBeGlzLnNldEZyb21NYXRyaXgzQ29sdW1uKCB0aGlzLCAwICk7XG5cdFx0eUF4aXMuc2V0RnJvbU1hdHJpeDNDb2x1bW4oIHRoaXMsIDEgKTtcblx0XHR6QXhpcy5zZXRGcm9tTWF0cml4M0NvbHVtbiggdGhpcywgMiApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21NYXRyaXg0KCBtICkge1xuXG5cdFx0Y29uc3QgbWUgPSBtLmVsZW1lbnRzO1xuXG5cdFx0dGhpcy5zZXQoXG5cblx0XHRcdG1lWyAwIF0sIG1lWyA0IF0sIG1lWyA4IF0sXG5cdFx0XHRtZVsgMSBdLCBtZVsgNSBdLCBtZVsgOSBdLFxuXHRcdFx0bWVbIDIgXSwgbWVbIDYgXSwgbWVbIDEwIF1cblxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bXVsdGlwbHkoIG0gKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseU1hdHJpY2VzKCB0aGlzLCBtICk7XG5cblx0fVxuXG5cdHByZW11bHRpcGx5KCBtICkge1xuXG5cdFx0cmV0dXJuIHRoaXMubXVsdGlwbHlNYXRyaWNlcyggbSwgdGhpcyApO1xuXG5cdH1cblxuXHRtdWx0aXBseU1hdHJpY2VzKCBhLCBiICkge1xuXG5cdFx0Y29uc3QgYWUgPSBhLmVsZW1lbnRzO1xuXHRcdGNvbnN0IGJlID0gYi5lbGVtZW50cztcblx0XHRjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHM7XG5cblx0XHRjb25zdCBhMTEgPSBhZVsgMCBdLCBhMTIgPSBhZVsgMyBdLCBhMTMgPSBhZVsgNiBdO1xuXHRcdGNvbnN0IGEyMSA9IGFlWyAxIF0sIGEyMiA9IGFlWyA0IF0sIGEyMyA9IGFlWyA3IF07XG5cdFx0Y29uc3QgYTMxID0gYWVbIDIgXSwgYTMyID0gYWVbIDUgXSwgYTMzID0gYWVbIDggXTtcblxuXHRcdGNvbnN0IGIxMSA9IGJlWyAwIF0sIGIxMiA9IGJlWyAzIF0sIGIxMyA9IGJlWyA2IF07XG5cdFx0Y29uc3QgYjIxID0gYmVbIDEgXSwgYjIyID0gYmVbIDQgXSwgYjIzID0gYmVbIDcgXTtcblx0XHRjb25zdCBiMzEgPSBiZVsgMiBdLCBiMzIgPSBiZVsgNSBdLCBiMzMgPSBiZVsgOCBdO1xuXG5cdFx0dGVbIDAgXSA9IGExMSAqIGIxMSArIGExMiAqIGIyMSArIGExMyAqIGIzMTtcblx0XHR0ZVsgMyBdID0gYTExICogYjEyICsgYTEyICogYjIyICsgYTEzICogYjMyO1xuXHRcdHRlWyA2IF0gPSBhMTEgKiBiMTMgKyBhMTIgKiBiMjMgKyBhMTMgKiBiMzM7XG5cblx0XHR0ZVsgMSBdID0gYTIxICogYjExICsgYTIyICogYjIxICsgYTIzICogYjMxO1xuXHRcdHRlWyA0IF0gPSBhMjEgKiBiMTIgKyBhMjIgKiBiMjIgKyBhMjMgKiBiMzI7XG5cdFx0dGVbIDcgXSA9IGEyMSAqIGIxMyArIGEyMiAqIGIyMyArIGEyMyAqIGIzMztcblxuXHRcdHRlWyAyIF0gPSBhMzEgKiBiMTEgKyBhMzIgKiBiMjEgKyBhMzMgKiBiMzE7XG5cdFx0dGVbIDUgXSA9IGEzMSAqIGIxMiArIGEzMiAqIGIyMiArIGEzMyAqIGIzMjtcblx0XHR0ZVsgOCBdID0gYTMxICogYjEzICsgYTMyICogYjIzICsgYTMzICogYjMzO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG11bHRpcGx5U2NhbGFyKCBzICkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG5cdFx0dGVbIDAgXSAqPSBzOyB0ZVsgMyBdICo9IHM7IHRlWyA2IF0gKj0gcztcblx0XHR0ZVsgMSBdICo9IHM7IHRlWyA0IF0gKj0gczsgdGVbIDcgXSAqPSBzO1xuXHRcdHRlWyAyIF0gKj0gczsgdGVbIDUgXSAqPSBzOyB0ZVsgOCBdICo9IHM7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0ZGV0ZXJtaW5hbnQoKSB7XG5cblx0XHRjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHM7XG5cblx0XHRjb25zdCBhID0gdGVbIDAgXSwgYiA9IHRlWyAxIF0sIGMgPSB0ZVsgMiBdLFxuXHRcdFx0ZCA9IHRlWyAzIF0sIGUgPSB0ZVsgNCBdLCBmID0gdGVbIDUgXSxcblx0XHRcdGcgPSB0ZVsgNiBdLCBoID0gdGVbIDcgXSwgaSA9IHRlWyA4IF07XG5cblx0XHRyZXR1cm4gYSAqIGUgKiBpIC0gYSAqIGYgKiBoIC0gYiAqIGQgKiBpICsgYiAqIGYgKiBnICsgYyAqIGQgKiBoIC0gYyAqIGUgKiBnO1xuXG5cdH1cblxuXHRpbnZlcnQoKSB7XG5cblx0XHRjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHMsXG5cblx0XHRcdG4xMSA9IHRlWyAwIF0sIG4yMSA9IHRlWyAxIF0sIG4zMSA9IHRlWyAyIF0sXG5cdFx0XHRuMTIgPSB0ZVsgMyBdLCBuMjIgPSB0ZVsgNCBdLCBuMzIgPSB0ZVsgNSBdLFxuXHRcdFx0bjEzID0gdGVbIDYgXSwgbjIzID0gdGVbIDcgXSwgbjMzID0gdGVbIDggXSxcblxuXHRcdFx0dDExID0gbjMzICogbjIyIC0gbjMyICogbjIzLFxuXHRcdFx0dDEyID0gbjMyICogbjEzIC0gbjMzICogbjEyLFxuXHRcdFx0dDEzID0gbjIzICogbjEyIC0gbjIyICogbjEzLFxuXG5cdFx0XHRkZXQgPSBuMTEgKiB0MTEgKyBuMjEgKiB0MTIgKyBuMzEgKiB0MTM7XG5cblx0XHRpZiAoIGRldCA9PT0gMCApIHJldHVybiB0aGlzLnNldCggMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCApO1xuXG5cdFx0Y29uc3QgZGV0SW52ID0gMSAvIGRldDtcblxuXHRcdHRlWyAwIF0gPSB0MTEgKiBkZXRJbnY7XG5cdFx0dGVbIDEgXSA9ICggbjMxICogbjIzIC0gbjMzICogbjIxICkgKiBkZXRJbnY7XG5cdFx0dGVbIDIgXSA9ICggbjMyICogbjIxIC0gbjMxICogbjIyICkgKiBkZXRJbnY7XG5cblx0XHR0ZVsgMyBdID0gdDEyICogZGV0SW52O1xuXHRcdHRlWyA0IF0gPSAoIG4zMyAqIG4xMSAtIG4zMSAqIG4xMyApICogZGV0SW52O1xuXHRcdHRlWyA1IF0gPSAoIG4zMSAqIG4xMiAtIG4zMiAqIG4xMSApICogZGV0SW52O1xuXG5cdFx0dGVbIDYgXSA9IHQxMyAqIGRldEludjtcblx0XHR0ZVsgNyBdID0gKCBuMjEgKiBuMTMgLSBuMjMgKiBuMTEgKSAqIGRldEludjtcblx0XHR0ZVsgOCBdID0gKCBuMjIgKiBuMTEgLSBuMjEgKiBuMTIgKSAqIGRldEludjtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR0cmFuc3Bvc2UoKSB7XG5cblx0XHRsZXQgdG1wO1xuXHRcdGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuXG5cdFx0dG1wID0gbVsgMSBdOyBtWyAxIF0gPSBtWyAzIF07IG1bIDMgXSA9IHRtcDtcblx0XHR0bXAgPSBtWyAyIF07IG1bIDIgXSA9IG1bIDYgXTsgbVsgNiBdID0gdG1wO1xuXHRcdHRtcCA9IG1bIDUgXTsgbVsgNSBdID0gbVsgNyBdOyBtWyA3IF0gPSB0bXA7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Z2V0Tm9ybWFsTWF0cml4KCBtYXRyaXg0ICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuc2V0RnJvbU1hdHJpeDQoIG1hdHJpeDQgKS5pbnZlcnQoKS50cmFuc3Bvc2UoKTtcblxuXHR9XG5cblx0dHJhbnNwb3NlSW50b0FycmF5KCByICkge1xuXG5cdFx0Y29uc3QgbSA9IHRoaXMuZWxlbWVudHM7XG5cblx0XHRyWyAwIF0gPSBtWyAwIF07XG5cdFx0clsgMSBdID0gbVsgMyBdO1xuXHRcdHJbIDIgXSA9IG1bIDYgXTtcblx0XHRyWyAzIF0gPSBtWyAxIF07XG5cdFx0clsgNCBdID0gbVsgNCBdO1xuXHRcdHJbIDUgXSA9IG1bIDcgXTtcblx0XHRyWyA2IF0gPSBtWyAyIF07XG5cdFx0clsgNyBdID0gbVsgNSBdO1xuXHRcdHJbIDggXSA9IG1bIDggXTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRVdlRyYW5zZm9ybSggdHgsIHR5LCBzeCwgc3ksIHJvdGF0aW9uLCBjeCwgY3kgKSB7XG5cblx0XHRjb25zdCBjID0gTWF0aC5jb3MoIHJvdGF0aW9uICk7XG5cdFx0Y29uc3QgcyA9IE1hdGguc2luKCByb3RhdGlvbiApO1xuXG5cdFx0dGhpcy5zZXQoXG5cdFx0XHRzeCAqIGMsIHN4ICogcywgLSBzeCAqICggYyAqIGN4ICsgcyAqIGN5ICkgKyBjeCArIHR4LFxuXHRcdFx0LSBzeSAqIHMsIHN5ICogYywgLSBzeSAqICggLSBzICogY3ggKyBjICogY3kgKSArIGN5ICsgdHksXG5cdFx0XHQwLCAwLCAxXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQvL1xuXG5cdHNjYWxlKCBzeCwgc3kgKSB7XG5cblx0XHR0aGlzLnByZW11bHRpcGx5KCBfbTMubWFrZVNjYWxlKCBzeCwgc3kgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHJvdGF0ZSggdGhldGEgKSB7XG5cblx0XHR0aGlzLnByZW11bHRpcGx5KCBfbTMubWFrZVJvdGF0aW9uKCAtIHRoZXRhICkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR0cmFuc2xhdGUoIHR4LCB0eSApIHtcblxuXHRcdHRoaXMucHJlbXVsdGlwbHkoIF9tMy5tYWtlVHJhbnNsYXRpb24oIHR4LCB0eSApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Ly8gZm9yIDJEIFRyYW5zZm9ybXNcblxuXHRtYWtlVHJhbnNsYXRpb24oIHgsIHkgKSB7XG5cblx0XHRpZiAoIHguaXNWZWN0b3IyICkge1xuXG5cdFx0XHR0aGlzLnNldChcblxuXHRcdFx0XHQxLCAwLCB4LngsXG5cdFx0XHRcdDAsIDEsIHgueSxcblx0XHRcdFx0MCwgMCwgMVxuXG5cdFx0XHQpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dGhpcy5zZXQoXG5cblx0XHRcdFx0MSwgMCwgeCxcblx0XHRcdFx0MCwgMSwgeSxcblx0XHRcdFx0MCwgMCwgMVxuXG5cdFx0XHQpO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG1ha2VSb3RhdGlvbiggdGhldGEgKSB7XG5cblx0XHQvLyBjb3VudGVyY2xvY2t3aXNlXG5cblx0XHRjb25zdCBjID0gTWF0aC5jb3MoIHRoZXRhICk7XG5cdFx0Y29uc3QgcyA9IE1hdGguc2luKCB0aGV0YSApO1xuXG5cdFx0dGhpcy5zZXQoXG5cblx0XHRcdGMsIC0gcywgMCxcblx0XHRcdHMsIGMsIDAsXG5cdFx0XHQwLCAwLCAxXG5cblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG1ha2VTY2FsZSggeCwgeSApIHtcblxuXHRcdHRoaXMuc2V0KFxuXG5cdFx0XHR4LCAwLCAwLFxuXHRcdFx0MCwgeSwgMCxcblx0XHRcdDAsIDAsIDFcblxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Ly9cblxuXHRlcXVhbHMoIG1hdHJpeCApIHtcblxuXHRcdGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcblx0XHRjb25zdCBtZSA9IG1hdHJpeC5lbGVtZW50cztcblxuXHRcdGZvciAoIGxldCBpID0gMDsgaSA8IDk7IGkgKysgKSB7XG5cblx0XHRcdGlmICggdGVbIGkgXSAhPT0gbWVbIGkgXSApIHJldHVybiBmYWxzZTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH1cblxuXHRmcm9tQXJyYXkoIGFycmF5LCBvZmZzZXQgPSAwICkge1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgOTsgaSArKyApIHtcblxuXHRcdFx0dGhpcy5lbGVtZW50c1sgaSBdID0gYXJyYXlbIGkgKyBvZmZzZXQgXTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR0b0FycmF5KCBhcnJheSA9IFtdLCBvZmZzZXQgPSAwICkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG5cdFx0YXJyYXlbIG9mZnNldCBdID0gdGVbIDAgXTtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMSBdID0gdGVbIDEgXTtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMiBdID0gdGVbIDIgXTtcblxuXHRcdGFycmF5WyBvZmZzZXQgKyAzIF0gPSB0ZVsgMyBdO1xuXHRcdGFycmF5WyBvZmZzZXQgKyA0IF0gPSB0ZVsgNCBdO1xuXHRcdGFycmF5WyBvZmZzZXQgKyA1IF0gPSB0ZVsgNSBdO1xuXG5cdFx0YXJyYXlbIG9mZnNldCArIDYgXSA9IHRlWyA2IF07XG5cdFx0YXJyYXlbIG9mZnNldCArIDcgXSA9IHRlWyA3IF07XG5cdFx0YXJyYXlbIG9mZnNldCArIDggXSA9IHRlWyA4IF07XG5cblx0XHRyZXR1cm4gYXJyYXk7XG5cblx0fVxuXG5cdGNsb25lKCkge1xuXG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCkuZnJvbUFycmF5KCB0aGlzLmVsZW1lbnRzICk7XG5cblx0fVxuXG59XG5cbmNvbnN0IF9tMyA9IC8qQF9fUFVSRV9fKi8gbmV3IE1hdHJpeDMoKTtcblxuZXhwb3J0IHsgTWF0cml4MyB9O1xuIiwiZnVuY3Rpb24gYXJyYXlNaW4oIGFycmF5ICkge1xuXG5cdGlmICggYXJyYXkubGVuZ3RoID09PSAwICkgcmV0dXJuIEluZmluaXR5O1xuXG5cdGxldCBtaW4gPSBhcnJheVsgMCBdO1xuXG5cdGZvciAoIGxldCBpID0gMSwgbCA9IGFycmF5Lmxlbmd0aDsgaSA8IGw7ICsrIGkgKSB7XG5cblx0XHRpZiAoIGFycmF5WyBpIF0gPCBtaW4gKSBtaW4gPSBhcnJheVsgaSBdO1xuXG5cdH1cblxuXHRyZXR1cm4gbWluO1xuXG59XG5cbmZ1bmN0aW9uIGFycmF5TWF4KCBhcnJheSApIHtcblxuXHRpZiAoIGFycmF5Lmxlbmd0aCA9PT0gMCApIHJldHVybiAtIEluZmluaXR5O1xuXG5cdGxldCBtYXggPSBhcnJheVsgMCBdO1xuXG5cdGZvciAoIGxldCBpID0gMSwgbCA9IGFycmF5Lmxlbmd0aDsgaSA8IGw7ICsrIGkgKSB7XG5cblx0XHRpZiAoIGFycmF5WyBpIF0gPiBtYXggKSBtYXggPSBhcnJheVsgaSBdO1xuXG5cdH1cblxuXHRyZXR1cm4gbWF4O1xuXG59XG5cbmZ1bmN0aW9uIGFycmF5TmVlZHNVaW50MzIoIGFycmF5ICkge1xuXG5cdC8vIGFzc3VtZXMgbGFyZ2VyIHZhbHVlcyB1c3VhbGx5IG9uIGxhc3RcblxuXHRmb3IgKCBsZXQgaSA9IGFycmF5Lmxlbmd0aCAtIDE7IGkgPj0gMDsgLS0gaSApIHtcblxuXHRcdGlmICggYXJyYXlbIGkgXSA+PSA2NTUzNSApIHJldHVybiB0cnVlOyAvLyBhY2NvdW50IGZvciBQUklNSVRJVkVfUkVTVEFSVF9GSVhFRF9JTkRFWCwgIzI0NTY1XG5cblx0fVxuXG5cdHJldHVybiBmYWxzZTtcblxufVxuXG5jb25zdCBUWVBFRF9BUlJBWVMgPSB7XG5cdEludDhBcnJheTogSW50OEFycmF5LFxuXHRVaW50OEFycmF5OiBVaW50OEFycmF5LFxuXHRVaW50OENsYW1wZWRBcnJheTogVWludDhDbGFtcGVkQXJyYXksXG5cdEludDE2QXJyYXk6IEludDE2QXJyYXksXG5cdFVpbnQxNkFycmF5OiBVaW50MTZBcnJheSxcblx0SW50MzJBcnJheTogSW50MzJBcnJheSxcblx0VWludDMyQXJyYXk6IFVpbnQzMkFycmF5LFxuXHRGbG9hdDMyQXJyYXk6IEZsb2F0MzJBcnJheSxcblx0RmxvYXQ2NEFycmF5OiBGbG9hdDY0QXJyYXlcbn07XG5cbmZ1bmN0aW9uIGdldFR5cGVkQXJyYXkoIHR5cGUsIGJ1ZmZlciApIHtcblxuXHRyZXR1cm4gbmV3IFRZUEVEX0FSUkFZU1sgdHlwZSBdKCBidWZmZXIgKTtcblxufVxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50TlMoIG5hbWUgKSB7XG5cblx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnLCBuYW1lICk7XG5cbn1cblxuY29uc3QgX2NhY2hlID0ge307XG5cbmZ1bmN0aW9uIHdhcm5PbmNlKCBtZXNzYWdlICkge1xuXG5cdGlmICggbWVzc2FnZSBpbiBfY2FjaGUgKSByZXR1cm47XG5cblx0X2NhY2hlWyBtZXNzYWdlIF0gPSB0cnVlO1xuXG5cdGNvbnNvbGUud2FybiggbWVzc2FnZSApO1xuXG59XG5cbmV4cG9ydCB7IGFycmF5TWluLCBhcnJheU1heCwgYXJyYXlOZWVkc1VpbnQzMiwgZ2V0VHlwZWRBcnJheSwgY3JlYXRlRWxlbWVudE5TLCB3YXJuT25jZSB9O1xuIiwiaW1wb3J0IHsgU1JHQkNvbG9yU3BhY2UsIExpbmVhclNSR0JDb2xvclNwYWNlLCBEaXNwbGF5UDNDb2xvclNwYWNlLCB9IGZyb20gJy4uL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBNYXRyaXgzIH0gZnJvbSAnLi9NYXRyaXgzLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIFNSR0JUb0xpbmVhciggYyApIHtcblxuXHRyZXR1cm4gKCBjIDwgMC4wNDA0NSApID8gYyAqIDAuMDc3Mzk5MzgwOCA6IE1hdGgucG93KCBjICogMC45NDc4NjcyOTg2ICsgMC4wNTIxMzI3MDE0LCAyLjQgKTtcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gTGluZWFyVG9TUkdCKCBjICkge1xuXG5cdHJldHVybiAoIGMgPCAwLjAwMzEzMDggKSA/IGMgKiAxMi45MiA6IDEuMDU1ICogKCBNYXRoLnBvdyggYywgMC40MTY2NiApICkgLSAwLjA1NTtcblxufVxuXG4vKipcbiAqIE1hdHJpY2VzIGNvbnZlcnRpbmcgUDMgPC0+IFJlYy4gNzA5IHByaW1hcmllcywgd2l0aG91dCBnYW11dCBtYXBwaW5nXG4gKiBvciBjbGlwcGluZy4gQmFzZWQgb24gVzNDIHNwZWNpZmljYXRpb25zIGZvciBzUkdCIGFuZCBEaXNwbGF5IFAzLFxuICogYW5kIElDQyBzcGVjaWZpY2F0aW9ucyBmb3IgdGhlIEQ1MCBjb25uZWN0aW9uIHNwYWNlLiBWYWx1ZXMgaW4vb3V0XG4gKiBhcmUgX2xpbmVhcl8gc1JHQiBhbmQgX2xpbmVhcl8gRGlzcGxheSBQMy5cbiAqXG4gKiBOb3RlIHRoYXQgYm90aCBzUkdCIGFuZCBEaXNwbGF5IFAzIHVzZSB0aGUgc1JHQiB0cmFuc2ZlciBmdW5jdGlvbnMuXG4gKlxuICogUmVmZXJlbmNlOlxuICogLSBodHRwOi8vd3d3LnJ1c3NlbGxjb3R0cmVsbC5jb20vcGhvdG8vbWF0cml4Q2FsY3VsYXRvci5odG1cbiAqL1xuXG5jb25zdCBMSU5FQVJfU1JHQl9UT19MSU5FQVJfRElTUExBWV9QMyA9IC8qQF9fUFVSRV9fKi8gbmV3IE1hdHJpeDMoKS5mcm9tQXJyYXkoIFtcblx0MC44MjI0NjIxLCAwLjAzMzE5NDEsIDAuMDE3MDgyNyxcblx0MC4xNzc1MzgwLCAwLjk2NjgwNTgsIDAuMDcyMzk3NCxcblx0LSAwLjAwMDAwMDEsIDAuMDAwMDAwMSwgMC45MTA1MTk5XG5dICk7XG5cbmNvbnN0IExJTkVBUl9ESVNQTEFZX1AzX1RPX0xJTkVBUl9TUkdCID0gLypAX19QVVJFX18qLyBuZXcgTWF0cml4MygpLmZyb21BcnJheSggW1xuXHQxLjIyNDk0MDEsIC0gMC4wNDIwNTY5LCAtIDAuMDE5NjM3Nixcblx0LSAwLjIyNDk0MDQsIDEuMDQyMDU3MSwgLSAwLjA3ODYzNjEsXG5cdDAuMDAwMDAwMSwgMC4wMDAwMDAwLCAxLjA5ODI3MzVcbl0gKTtcblxuZnVuY3Rpb24gRGlzcGxheVAzVG9MaW5lYXJTUkdCKCBjb2xvciApIHtcblxuXHQvLyBEaXNwbGF5IFAzIHVzZXMgdGhlIHNSR0IgdHJhbnNmZXIgZnVuY3Rpb25zXG5cdHJldHVybiBjb2xvci5jb252ZXJ0U1JHQlRvTGluZWFyKCkuYXBwbHlNYXRyaXgzKCBMSU5FQVJfRElTUExBWV9QM19UT19MSU5FQVJfU1JHQiApO1xuXG59XG5cbmZ1bmN0aW9uIExpbmVhclNSR0JUb0Rpc3BsYXlQMyggY29sb3IgKSB7XG5cblx0Ly8gRGlzcGxheSBQMyB1c2VzIHRoZSBzUkdCIHRyYW5zZmVyIGZ1bmN0aW9uc1xuXHRyZXR1cm4gY29sb3IuYXBwbHlNYXRyaXgzKCBMSU5FQVJfU1JHQl9UT19MSU5FQVJfRElTUExBWV9QMyApLmNvbnZlcnRMaW5lYXJUb1NSR0IoKTtcblxufVxuXG4vLyBDb252ZXJzaW9ucyBmcm9tIDxzb3VyY2U+IHRvIExpbmVhci1zUkdCIHJlZmVyZW5jZSBzcGFjZS5cbmNvbnN0IFRPX0xJTkVBUiA9IHtcblx0WyBMaW5lYXJTUkdCQ29sb3JTcGFjZSBdOiAoIGNvbG9yICkgPT4gY29sb3IsXG5cdFsgU1JHQkNvbG9yU3BhY2UgXTogKCBjb2xvciApID0+IGNvbG9yLmNvbnZlcnRTUkdCVG9MaW5lYXIoKSxcblx0WyBEaXNwbGF5UDNDb2xvclNwYWNlIF06IERpc3BsYXlQM1RvTGluZWFyU1JHQixcbn07XG5cbi8vIENvbnZlcnNpb25zIHRvIDx0YXJnZXQ+IGZyb20gTGluZWFyLXNSR0IgcmVmZXJlbmNlIHNwYWNlLlxuY29uc3QgRlJPTV9MSU5FQVIgPSB7XG5cdFsgTGluZWFyU1JHQkNvbG9yU3BhY2UgXTogKCBjb2xvciApID0+IGNvbG9yLFxuXHRbIFNSR0JDb2xvclNwYWNlIF06ICggY29sb3IgKSA9PiBjb2xvci5jb252ZXJ0TGluZWFyVG9TUkdCKCksXG5cdFsgRGlzcGxheVAzQ29sb3JTcGFjZSBdOiBMaW5lYXJTUkdCVG9EaXNwbGF5UDMsXG59O1xuXG5leHBvcnQgY29uc3QgQ29sb3JNYW5hZ2VtZW50ID0ge1xuXG5cdGVuYWJsZWQ6IHRydWUsXG5cblx0Z2V0IGxlZ2FjeU1vZGUoKSB7XG5cblx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5Db2xvck1hbmFnZW1lbnQ6IC5sZWdhY3lNb2RlPWZhbHNlIHJlbmFtZWQgdG8gLmVuYWJsZWQ9dHJ1ZSBpbiByMTUwLicgKTtcblxuXHRcdHJldHVybiAhIHRoaXMuZW5hYmxlZDtcblxuXHR9LFxuXG5cdHNldCBsZWdhY3lNb2RlKCBsZWdhY3lNb2RlICkge1xuXG5cdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuQ29sb3JNYW5hZ2VtZW50OiAubGVnYWN5TW9kZT1mYWxzZSByZW5hbWVkIHRvIC5lbmFibGVkPXRydWUgaW4gcjE1MC4nICk7XG5cblx0XHR0aGlzLmVuYWJsZWQgPSAhIGxlZ2FjeU1vZGU7XG5cblx0fSxcblxuXHRnZXQgd29ya2luZ0NvbG9yU3BhY2UoKSB7XG5cblx0XHRyZXR1cm4gTGluZWFyU1JHQkNvbG9yU3BhY2U7XG5cblx0fSxcblxuXHRzZXQgd29ya2luZ0NvbG9yU3BhY2UoIGNvbG9yU3BhY2UgKSB7XG5cblx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5Db2xvck1hbmFnZW1lbnQ6IC53b3JraW5nQ29sb3JTcGFjZSBpcyByZWFkb25seS4nICk7XG5cblx0fSxcblxuXHRjb252ZXJ0OiBmdW5jdGlvbiAoIGNvbG9yLCBzb3VyY2VDb2xvclNwYWNlLCB0YXJnZXRDb2xvclNwYWNlICkge1xuXG5cdFx0aWYgKCB0aGlzLmVuYWJsZWQgPT09IGZhbHNlIHx8IHNvdXJjZUNvbG9yU3BhY2UgPT09IHRhcmdldENvbG9yU3BhY2UgfHwgISBzb3VyY2VDb2xvclNwYWNlIHx8ICEgdGFyZ2V0Q29sb3JTcGFjZSApIHtcblxuXHRcdFx0cmV0dXJuIGNvbG9yO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3Qgc291cmNlVG9MaW5lYXIgPSBUT19MSU5FQVJbIHNvdXJjZUNvbG9yU3BhY2UgXTtcblx0XHRjb25zdCB0YXJnZXRGcm9tTGluZWFyID0gRlJPTV9MSU5FQVJbIHRhcmdldENvbG9yU3BhY2UgXTtcblxuXHRcdGlmICggc291cmNlVG9MaW5lYXIgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXRGcm9tTGluZWFyID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHRocm93IG5ldyBFcnJvciggYFVuc3VwcG9ydGVkIGNvbG9yIHNwYWNlIGNvbnZlcnNpb24sIFwiJHsgc291cmNlQ29sb3JTcGFjZSB9XCIgdG8gXCIkeyB0YXJnZXRDb2xvclNwYWNlIH1cIi5gICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGFyZ2V0RnJvbUxpbmVhciggc291cmNlVG9MaW5lYXIoIGNvbG9yICkgKTtcblxuXHR9LFxuXG5cdGZyb21Xb3JraW5nQ29sb3JTcGFjZTogZnVuY3Rpb24gKCBjb2xvciwgdGFyZ2V0Q29sb3JTcGFjZSApIHtcblxuXHRcdHJldHVybiB0aGlzLmNvbnZlcnQoIGNvbG9yLCB0aGlzLndvcmtpbmdDb2xvclNwYWNlLCB0YXJnZXRDb2xvclNwYWNlICk7XG5cblx0fSxcblxuXHR0b1dvcmtpbmdDb2xvclNwYWNlOiBmdW5jdGlvbiAoIGNvbG9yLCBzb3VyY2VDb2xvclNwYWNlICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuY29udmVydCggY29sb3IsIHNvdXJjZUNvbG9yU3BhY2UsIHRoaXMud29ya2luZ0NvbG9yU3BhY2UgKTtcblxuXHR9LFxuXG59O1xuIiwiaW1wb3J0IHsgY3JlYXRlRWxlbWVudE5TIH0gZnJvbSAnLi4vdXRpbHMuanMnO1xuaW1wb3J0IHsgU1JHQlRvTGluZWFyIH0gZnJvbSAnLi4vbWF0aC9Db2xvck1hbmFnZW1lbnQuanMnO1xuXG5sZXQgX2NhbnZhcztcblxuY2xhc3MgSW1hZ2VVdGlscyB7XG5cblx0c3RhdGljIGdldERhdGFVUkwoIGltYWdlICkge1xuXG5cdFx0aWYgKCAvXmRhdGE6L2kudGVzdCggaW1hZ2Uuc3JjICkgKSB7XG5cblx0XHRcdHJldHVybiBpbWFnZS5zcmM7XG5cblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiBIVE1MQ2FudmFzRWxlbWVudCA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cblx0XHRcdHJldHVybiBpbWFnZS5zcmM7XG5cblx0XHR9XG5cblx0XHRsZXQgY2FudmFzO1xuXG5cdFx0aWYgKCBpbWFnZSBpbnN0YW5jZW9mIEhUTUxDYW52YXNFbGVtZW50ICkge1xuXG5cdFx0XHRjYW52YXMgPSBpbWFnZTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGlmICggX2NhbnZhcyA9PT0gdW5kZWZpbmVkICkgX2NhbnZhcyA9IGNyZWF0ZUVsZW1lbnROUyggJ2NhbnZhcycgKTtcblxuXHRcdFx0X2NhbnZhcy53aWR0aCA9IGltYWdlLndpZHRoO1xuXHRcdFx0X2NhbnZhcy5oZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG5cblx0XHRcdGNvbnN0IGNvbnRleHQgPSBfY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcblxuXHRcdFx0aWYgKCBpbWFnZSBpbnN0YW5jZW9mIEltYWdlRGF0YSApIHtcblxuXHRcdFx0XHRjb250ZXh0LnB1dEltYWdlRGF0YSggaW1hZ2UsIDAsIDAgKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRjb250ZXh0LmRyYXdJbWFnZSggaW1hZ2UsIDAsIDAsIGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRjYW52YXMgPSBfY2FudmFzO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBjYW52YXMud2lkdGggPiAyMDQ4IHx8IGNhbnZhcy5oZWlnaHQgPiAyMDQ4ICkge1xuXG5cdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5JbWFnZVV0aWxzLmdldERhdGFVUkw6IEltYWdlIGNvbnZlcnRlZCB0byBqcGcgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMnLCBpbWFnZSApO1xuXG5cdFx0XHRyZXR1cm4gY2FudmFzLnRvRGF0YVVSTCggJ2ltYWdlL2pwZWcnLCAwLjYgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHJldHVybiBjYW52YXMudG9EYXRhVVJMKCAnaW1hZ2UvcG5nJyApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRzdGF0aWMgc1JHQlRvTGluZWFyKCBpbWFnZSApIHtcblxuXHRcdGlmICggKCB0eXBlb2YgSFRNTEltYWdlRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1hZ2UgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50ICkgfHxcblx0XHRcdCggdHlwZW9mIEhUTUxDYW52YXNFbGVtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBpbWFnZSBpbnN0YW5jZW9mIEhUTUxDYW52YXNFbGVtZW50ICkgfHxcblx0XHRcdCggdHlwZW9mIEltYWdlQml0bWFwICE9PSAndW5kZWZpbmVkJyAmJiBpbWFnZSBpbnN0YW5jZW9mIEltYWdlQml0bWFwICkgKSB7XG5cblx0XHRcdGNvbnN0IGNhbnZhcyA9IGNyZWF0ZUVsZW1lbnROUyggJ2NhbnZhcycgKTtcblxuXHRcdFx0Y2FudmFzLndpZHRoID0gaW1hZ2Uud2lkdGg7XG5cdFx0XHRjYW52YXMuaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuXG5cdFx0XHRjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcblx0XHRcdGNvbnRleHQuZHJhd0ltYWdlKCBpbWFnZSwgMCwgMCwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCApO1xuXG5cdFx0XHRjb25zdCBpbWFnZURhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSggMCwgMCwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCApO1xuXHRcdFx0Y29uc3QgZGF0YSA9IGltYWdlRGF0YS5kYXRhO1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSArKyApIHtcblxuXHRcdFx0XHRkYXRhWyBpIF0gPSBTUkdCVG9MaW5lYXIoIGRhdGFbIGkgXSAvIDI1NSApICogMjU1O1xuXG5cdFx0XHR9XG5cblx0XHRcdGNvbnRleHQucHV0SW1hZ2VEYXRhKCBpbWFnZURhdGEsIDAsIDAgKTtcblxuXHRcdFx0cmV0dXJuIGNhbnZhcztcblxuXHRcdH0gZWxzZSBpZiAoIGltYWdlLmRhdGEgKSB7XG5cblx0XHRcdGNvbnN0IGRhdGEgPSBpbWFnZS5kYXRhLnNsaWNlKCAwICk7XG5cblx0XHRcdGZvciAoIGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpICsrICkge1xuXG5cdFx0XHRcdGlmICggZGF0YSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgfHwgZGF0YSBpbnN0YW5jZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICkge1xuXG5cdFx0XHRcdFx0ZGF0YVsgaSBdID0gTWF0aC5mbG9vciggU1JHQlRvTGluZWFyKCBkYXRhWyBpIF0gLyAyNTUgKSAqIDI1NSApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHQvLyBhc3N1bWluZyBmbG9hdFxuXG5cdFx0XHRcdFx0ZGF0YVsgaSBdID0gU1JHQlRvTGluZWFyKCBkYXRhWyBpIF0gKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdFx0d2lkdGg6IGltYWdlLndpZHRoLFxuXHRcdFx0XHRoZWlnaHQ6IGltYWdlLmhlaWdodFxuXHRcdFx0fTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGNvbnNvbGUud2FybiggJ1RIUkVFLkltYWdlVXRpbHMuc1JHQlRvTGluZWFyKCk6IFVuc3VwcG9ydGVkIGltYWdlIHR5cGUuIE5vIGNvbG9yIHNwYWNlIGNvbnZlcnNpb24gYXBwbGllZC4nICk7XG5cdFx0XHRyZXR1cm4gaW1hZ2U7XG5cblx0XHR9XG5cblx0fVxuXG59XG5cbmV4cG9ydCB7IEltYWdlVXRpbHMgfTtcbiIsImltcG9ydCB7IEltYWdlVXRpbHMgfSBmcm9tICcuLi9leHRyYXMvSW1hZ2VVdGlscy5qcyc7XG5pbXBvcnQgKiBhcyBNYXRoVXRpbHMgZnJvbSAnLi4vbWF0aC9NYXRoVXRpbHMuanMnO1xuXG5sZXQgc291cmNlSWQgPSAwO1xuXG5jbGFzcyBTb3VyY2Uge1xuXG5cdGNvbnN0cnVjdG9yKCBkYXRhID0gbnVsbCApIHtcblxuXHRcdHRoaXMuaXNTb3VyY2UgPSB0cnVlO1xuXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCB0aGlzLCAnaWQnLCB7IHZhbHVlOiBzb3VyY2VJZCArKyB9ICk7XG5cblx0XHR0aGlzLnV1aWQgPSBNYXRoVXRpbHMuZ2VuZXJhdGVVVUlEKCk7XG5cblx0XHR0aGlzLmRhdGEgPSBkYXRhO1xuXG5cdFx0dGhpcy52ZXJzaW9uID0gMDtcblxuXHR9XG5cblx0c2V0IG5lZWRzVXBkYXRlKCB2YWx1ZSApIHtcblxuXHRcdGlmICggdmFsdWUgPT09IHRydWUgKSB0aGlzLnZlcnNpb24gKys7XG5cblx0fVxuXG5cdHRvSlNPTiggbWV0YSApIHtcblxuXHRcdGNvbnN0IGlzUm9vdE9iamVjdCA9ICggbWV0YSA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBtZXRhID09PSAnc3RyaW5nJyApO1xuXG5cdFx0aWYgKCAhIGlzUm9vdE9iamVjdCAmJiBtZXRhLmltYWdlc1sgdGhpcy51dWlkIF0gIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0cmV0dXJuIG1ldGEuaW1hZ2VzWyB0aGlzLnV1aWQgXTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IG91dHB1dCA9IHtcblx0XHRcdHV1aWQ6IHRoaXMudXVpZCxcblx0XHRcdHVybDogJydcblx0XHR9O1xuXG5cdFx0Y29uc3QgZGF0YSA9IHRoaXMuZGF0YTtcblxuXHRcdGlmICggZGF0YSAhPT0gbnVsbCApIHtcblxuXHRcdFx0bGV0IHVybDtcblxuXHRcdFx0aWYgKCBBcnJheS5pc0FycmF5KCBkYXRhICkgKSB7XG5cblx0XHRcdFx0Ly8gY3ViZSB0ZXh0dXJlXG5cblx0XHRcdFx0dXJsID0gW107XG5cblx0XHRcdFx0Zm9yICggbGV0IGkgPSAwLCBsID0gZGF0YS5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRcdFx0aWYgKCBkYXRhWyBpIF0uaXNEYXRhVGV4dHVyZSApIHtcblxuXHRcdFx0XHRcdFx0dXJsLnB1c2goIHNlcmlhbGl6ZUltYWdlKCBkYXRhWyBpIF0uaW1hZ2UgKSApO1xuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0dXJsLnB1c2goIHNlcmlhbGl6ZUltYWdlKCBkYXRhWyBpIF0gKSApO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyB0ZXh0dXJlXG5cblx0XHRcdFx0dXJsID0gc2VyaWFsaXplSW1hZ2UoIGRhdGEgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRvdXRwdXQudXJsID0gdXJsO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCAhIGlzUm9vdE9iamVjdCApIHtcblxuXHRcdFx0bWV0YS5pbWFnZXNbIHRoaXMudXVpZCBdID0gb3V0cHV0O1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dDtcblxuXHR9XG5cbn1cblxuZnVuY3Rpb24gc2VyaWFsaXplSW1hZ2UoIGltYWdlICkge1xuXG5cdGlmICggKCB0eXBlb2YgSFRNTEltYWdlRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1hZ2UgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50ICkgfHxcblx0XHQoIHR5cGVvZiBIVE1MQ2FudmFzRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1hZ2UgaW5zdGFuY2VvZiBIVE1MQ2FudmFzRWxlbWVudCApIHx8XG5cdFx0KCB0eXBlb2YgSW1hZ2VCaXRtYXAgIT09ICd1bmRlZmluZWQnICYmIGltYWdlIGluc3RhbmNlb2YgSW1hZ2VCaXRtYXAgKSApIHtcblxuXHRcdC8vIGRlZmF1bHQgaW1hZ2VzXG5cblx0XHRyZXR1cm4gSW1hZ2VVdGlscy5nZXREYXRhVVJMKCBpbWFnZSApO1xuXG5cdH0gZWxzZSB7XG5cblx0XHRpZiAoIGltYWdlLmRhdGEgKSB7XG5cblx0XHRcdC8vIGltYWdlcyBvZiBEYXRhVGV4dHVyZVxuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRkYXRhOiBBcnJheS5mcm9tKCBpbWFnZS5kYXRhICksXG5cdFx0XHRcdHdpZHRoOiBpbWFnZS53aWR0aCxcblx0XHRcdFx0aGVpZ2h0OiBpbWFnZS5oZWlnaHQsXG5cdFx0XHRcdHR5cGU6IGltYWdlLmRhdGEuY29uc3RydWN0b3IubmFtZVxuXHRcdFx0fTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGNvbnNvbGUud2FybiggJ1RIUkVFLlRleHR1cmU6IFVuYWJsZSB0byBzZXJpYWxpemUgVGV4dHVyZS4nICk7XG5cdFx0XHRyZXR1cm4ge307XG5cblx0XHR9XG5cblx0fVxuXG59XG5cbmV4cG9ydCB7IFNvdXJjZSB9O1xuIiwiaW1wb3J0IHsgRXZlbnREaXNwYXRjaGVyIH0gZnJvbSAnLi4vY29yZS9FdmVudERpc3BhdGNoZXIuanMnO1xuaW1wb3J0IHtcblx0TWlycm9yZWRSZXBlYXRXcmFwcGluZyxcblx0Q2xhbXBUb0VkZ2VXcmFwcGluZyxcblx0UmVwZWF0V3JhcHBpbmcsXG5cdFVuc2lnbmVkQnl0ZVR5cGUsXG5cdFJHQkFGb3JtYXQsXG5cdExpbmVhck1pcG1hcExpbmVhckZpbHRlcixcblx0TGluZWFyRmlsdGVyLFxuXHRVVk1hcHBpbmcsXG5cdHNSR0JFbmNvZGluZyxcblx0U1JHQkNvbG9yU3BhY2UsXG5cdE5vQ29sb3JTcGFjZSxcblx0TGluZWFyRW5jb2Rpbmdcbn0gZnJvbSAnLi4vY29uc3RhbnRzLmpzJztcbmltcG9ydCAqIGFzIE1hdGhVdGlscyBmcm9tICcuLi9tYXRoL01hdGhVdGlscy5qcyc7XG5pbXBvcnQgeyBWZWN0b3IyIH0gZnJvbSAnLi4vbWF0aC9WZWN0b3IyLmpzJztcbmltcG9ydCB7IE1hdHJpeDMgfSBmcm9tICcuLi9tYXRoL01hdHJpeDMuanMnO1xuaW1wb3J0IHsgU291cmNlIH0gZnJvbSAnLi9Tb3VyY2UuanMnO1xuaW1wb3J0IHsgd2Fybk9uY2UgfSBmcm9tICcuLi91dGlscy5qcyc7XG5cbmxldCB0ZXh0dXJlSWQgPSAwO1xuXG5jbGFzcyBUZXh0dXJlIGV4dGVuZHMgRXZlbnREaXNwYXRjaGVyIHtcblxuXHRjb25zdHJ1Y3RvciggaW1hZ2UgPSBUZXh0dXJlLkRFRkFVTFRfSU1BR0UsIG1hcHBpbmcgPSBUZXh0dXJlLkRFRkFVTFRfTUFQUElORywgd3JhcFMgPSBDbGFtcFRvRWRnZVdyYXBwaW5nLCB3cmFwVCA9IENsYW1wVG9FZGdlV3JhcHBpbmcsIG1hZ0ZpbHRlciA9IExpbmVhckZpbHRlciwgbWluRmlsdGVyID0gTGluZWFyTWlwbWFwTGluZWFyRmlsdGVyLCBmb3JtYXQgPSBSR0JBRm9ybWF0LCB0eXBlID0gVW5zaWduZWRCeXRlVHlwZSwgYW5pc290cm9weSA9IFRleHR1cmUuREVGQVVMVF9BTklTT1RST1BZLCBjb2xvclNwYWNlID0gTm9Db2xvclNwYWNlICkge1xuXG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuaXNUZXh0dXJlID0gdHJ1ZTtcblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ2lkJywgeyB2YWx1ZTogdGV4dHVyZUlkICsrIH0gKTtcblxuXHRcdHRoaXMudXVpZCA9IE1hdGhVdGlscy5nZW5lcmF0ZVVVSUQoKTtcblxuXHRcdHRoaXMubmFtZSA9ICcnO1xuXG5cdFx0dGhpcy5zb3VyY2UgPSBuZXcgU291cmNlKCBpbWFnZSApO1xuXHRcdHRoaXMubWlwbWFwcyA9IFtdO1xuXG5cdFx0dGhpcy5tYXBwaW5nID0gbWFwcGluZztcblx0XHR0aGlzLmNoYW5uZWwgPSAwO1xuXG5cdFx0dGhpcy53cmFwUyA9IHdyYXBTO1xuXHRcdHRoaXMud3JhcFQgPSB3cmFwVDtcblxuXHRcdHRoaXMubWFnRmlsdGVyID0gbWFnRmlsdGVyO1xuXHRcdHRoaXMubWluRmlsdGVyID0gbWluRmlsdGVyO1xuXG5cdFx0dGhpcy5hbmlzb3Ryb3B5ID0gYW5pc290cm9weTtcblxuXHRcdHRoaXMuZm9ybWF0ID0gZm9ybWF0O1xuXHRcdHRoaXMuaW50ZXJuYWxGb3JtYXQgPSBudWxsO1xuXHRcdHRoaXMudHlwZSA9IHR5cGU7XG5cblx0XHR0aGlzLm9mZnNldCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG5cdFx0dGhpcy5yZXBlYXQgPSBuZXcgVmVjdG9yMiggMSwgMSApO1xuXHRcdHRoaXMuY2VudGVyID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcblx0XHR0aGlzLnJvdGF0aW9uID0gMDtcblxuXHRcdHRoaXMubWF0cml4QXV0b1VwZGF0ZSA9IHRydWU7XG5cdFx0dGhpcy5tYXRyaXggPSBuZXcgTWF0cml4MygpO1xuXG5cdFx0dGhpcy5nZW5lcmF0ZU1pcG1hcHMgPSB0cnVlO1xuXHRcdHRoaXMucHJlbXVsdGlwbHlBbHBoYSA9IGZhbHNlO1xuXHRcdHRoaXMuZmxpcFkgPSB0cnVlO1xuXHRcdHRoaXMudW5wYWNrQWxpZ25tZW50ID0gNDtcdC8vIHZhbGlkIHZhbHVlczogMSwgMiwgNCwgOCAoc2VlIGh0dHA6Ly93d3cua2hyb25vcy5vcmcvb3BlbmdsZXMvc2RrL2RvY3MvbWFuL3hodG1sL2dsUGl4ZWxTdG9yZWkueG1sKVxuXG5cdFx0aWYgKCB0eXBlb2YgY29sb3JTcGFjZSA9PT0gJ3N0cmluZycgKSB7XG5cblx0XHRcdHRoaXMuY29sb3JTcGFjZSA9IGNvbG9yU3BhY2U7XG5cblx0XHR9IGVsc2UgeyAvLyBAZGVwcmVjYXRlZCwgcjE1MlxuXG5cdFx0XHR3YXJuT25jZSggJ1RIUkVFLlRleHR1cmU6IFByb3BlcnR5IC5lbmNvZGluZyBoYXMgYmVlbiByZXBsYWNlZCBieSAuY29sb3JTcGFjZS4nICk7XG5cdFx0XHR0aGlzLmNvbG9yU3BhY2UgPSBjb2xvclNwYWNlID09PSBzUkdCRW5jb2RpbmcgPyBTUkdCQ29sb3JTcGFjZSA6IE5vQ29sb3JTcGFjZTtcblxuXHRcdH1cblxuXG5cdFx0dGhpcy51c2VyRGF0YSA9IHt9O1xuXG5cdFx0dGhpcy52ZXJzaW9uID0gMDtcblx0XHR0aGlzLm9uVXBkYXRlID0gbnVsbDtcblxuXHRcdHRoaXMuaXNSZW5kZXJUYXJnZXRUZXh0dXJlID0gZmFsc2U7IC8vIGluZGljYXRlcyB3aGV0aGVyIGEgdGV4dHVyZSBiZWxvbmdzIHRvIGEgcmVuZGVyIHRhcmdldCBvciBub3Rcblx0XHR0aGlzLm5lZWRzUE1SRU1VcGRhdGUgPSBmYWxzZTsgLy8gaW5kaWNhdGVzIHdoZXRoZXIgdGhpcyB0ZXh0dXJlIHNob3VsZCBiZSBwcm9jZXNzZWQgYnkgUE1SRU1HZW5lcmF0b3Igb3Igbm90IChvbmx5IHJlbGV2YW50IGZvciByZW5kZXIgdGFyZ2V0IHRleHR1cmVzKVxuXG5cdH1cblxuXHRnZXQgaW1hZ2UoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5zb3VyY2UuZGF0YTtcblxuXHR9XG5cblx0c2V0IGltYWdlKCB2YWx1ZSA9IG51bGwgKSB7XG5cblx0XHR0aGlzLnNvdXJjZS5kYXRhID0gdmFsdWU7XG5cblx0fVxuXG5cdHVwZGF0ZU1hdHJpeCgpIHtcblxuXHRcdHRoaXMubWF0cml4LnNldFV2VHJhbnNmb3JtKCB0aGlzLm9mZnNldC54LCB0aGlzLm9mZnNldC55LCB0aGlzLnJlcGVhdC54LCB0aGlzLnJlcGVhdC55LCB0aGlzLnJvdGF0aW9uLCB0aGlzLmNlbnRlci54LCB0aGlzLmNlbnRlci55ICk7XG5cblx0fVxuXG5cdGNsb25lKCkge1xuXG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCkuY29weSggdGhpcyApO1xuXG5cdH1cblxuXHRjb3B5KCBzb3VyY2UgKSB7XG5cblx0XHR0aGlzLm5hbWUgPSBzb3VyY2UubmFtZTtcblxuXHRcdHRoaXMuc291cmNlID0gc291cmNlLnNvdXJjZTtcblx0XHR0aGlzLm1pcG1hcHMgPSBzb3VyY2UubWlwbWFwcy5zbGljZSggMCApO1xuXG5cdFx0dGhpcy5tYXBwaW5nID0gc291cmNlLm1hcHBpbmc7XG5cdFx0dGhpcy5jaGFubmVsID0gc291cmNlLmNoYW5uZWw7XG5cblx0XHR0aGlzLndyYXBTID0gc291cmNlLndyYXBTO1xuXHRcdHRoaXMud3JhcFQgPSBzb3VyY2Uud3JhcFQ7XG5cblx0XHR0aGlzLm1hZ0ZpbHRlciA9IHNvdXJjZS5tYWdGaWx0ZXI7XG5cdFx0dGhpcy5taW5GaWx0ZXIgPSBzb3VyY2UubWluRmlsdGVyO1xuXG5cdFx0dGhpcy5hbmlzb3Ryb3B5ID0gc291cmNlLmFuaXNvdHJvcHk7XG5cblx0XHR0aGlzLmZvcm1hdCA9IHNvdXJjZS5mb3JtYXQ7XG5cdFx0dGhpcy5pbnRlcm5hbEZvcm1hdCA9IHNvdXJjZS5pbnRlcm5hbEZvcm1hdDtcblx0XHR0aGlzLnR5cGUgPSBzb3VyY2UudHlwZTtcblxuXHRcdHRoaXMub2Zmc2V0LmNvcHkoIHNvdXJjZS5vZmZzZXQgKTtcblx0XHR0aGlzLnJlcGVhdC5jb3B5KCBzb3VyY2UucmVwZWF0ICk7XG5cdFx0dGhpcy5jZW50ZXIuY29weSggc291cmNlLmNlbnRlciApO1xuXHRcdHRoaXMucm90YXRpb24gPSBzb3VyY2Uucm90YXRpb247XG5cblx0XHR0aGlzLm1hdHJpeEF1dG9VcGRhdGUgPSBzb3VyY2UubWF0cml4QXV0b1VwZGF0ZTtcblx0XHR0aGlzLm1hdHJpeC5jb3B5KCBzb3VyY2UubWF0cml4ICk7XG5cblx0XHR0aGlzLmdlbmVyYXRlTWlwbWFwcyA9IHNvdXJjZS5nZW5lcmF0ZU1pcG1hcHM7XG5cdFx0dGhpcy5wcmVtdWx0aXBseUFscGhhID0gc291cmNlLnByZW11bHRpcGx5QWxwaGE7XG5cdFx0dGhpcy5mbGlwWSA9IHNvdXJjZS5mbGlwWTtcblx0XHR0aGlzLnVucGFja0FsaWdubWVudCA9IHNvdXJjZS51bnBhY2tBbGlnbm1lbnQ7XG5cdFx0dGhpcy5jb2xvclNwYWNlID0gc291cmNlLmNvbG9yU3BhY2U7XG5cblx0XHR0aGlzLnVzZXJEYXRhID0gSlNPTi5wYXJzZSggSlNPTi5zdHJpbmdpZnkoIHNvdXJjZS51c2VyRGF0YSApICk7XG5cblx0XHR0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR0b0pTT04oIG1ldGEgKSB7XG5cblx0XHRjb25zdCBpc1Jvb3RPYmplY3QgPSAoIG1ldGEgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgbWV0YSA9PT0gJ3N0cmluZycgKTtcblxuXHRcdGlmICggISBpc1Jvb3RPYmplY3QgJiYgbWV0YS50ZXh0dXJlc1sgdGhpcy51dWlkIF0gIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0cmV0dXJuIG1ldGEudGV4dHVyZXNbIHRoaXMudXVpZCBdO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3Qgb3V0cHV0ID0ge1xuXG5cdFx0XHRtZXRhZGF0YToge1xuXHRcdFx0XHR2ZXJzaW9uOiA0LjYsXG5cdFx0XHRcdHR5cGU6ICdUZXh0dXJlJyxcblx0XHRcdFx0Z2VuZXJhdG9yOiAnVGV4dHVyZS50b0pTT04nXG5cdFx0XHR9LFxuXG5cdFx0XHR1dWlkOiB0aGlzLnV1aWQsXG5cdFx0XHRuYW1lOiB0aGlzLm5hbWUsXG5cblx0XHRcdGltYWdlOiB0aGlzLnNvdXJjZS50b0pTT04oIG1ldGEgKS51dWlkLFxuXG5cdFx0XHRtYXBwaW5nOiB0aGlzLm1hcHBpbmcsXG5cdFx0XHRjaGFubmVsOiB0aGlzLmNoYW5uZWwsXG5cblx0XHRcdHJlcGVhdDogWyB0aGlzLnJlcGVhdC54LCB0aGlzLnJlcGVhdC55IF0sXG5cdFx0XHRvZmZzZXQ6IFsgdGhpcy5vZmZzZXQueCwgdGhpcy5vZmZzZXQueSBdLFxuXHRcdFx0Y2VudGVyOiBbIHRoaXMuY2VudGVyLngsIHRoaXMuY2VudGVyLnkgXSxcblx0XHRcdHJvdGF0aW9uOiB0aGlzLnJvdGF0aW9uLFxuXG5cdFx0XHR3cmFwOiBbIHRoaXMud3JhcFMsIHRoaXMud3JhcFQgXSxcblxuXHRcdFx0Zm9ybWF0OiB0aGlzLmZvcm1hdCxcblx0XHRcdGludGVybmFsRm9ybWF0OiB0aGlzLmludGVybmFsRm9ybWF0LFxuXHRcdFx0dHlwZTogdGhpcy50eXBlLFxuXHRcdFx0Y29sb3JTcGFjZTogdGhpcy5jb2xvclNwYWNlLFxuXG5cdFx0XHRtaW5GaWx0ZXI6IHRoaXMubWluRmlsdGVyLFxuXHRcdFx0bWFnRmlsdGVyOiB0aGlzLm1hZ0ZpbHRlcixcblx0XHRcdGFuaXNvdHJvcHk6IHRoaXMuYW5pc290cm9weSxcblxuXHRcdFx0ZmxpcFk6IHRoaXMuZmxpcFksXG5cblx0XHRcdGdlbmVyYXRlTWlwbWFwczogdGhpcy5nZW5lcmF0ZU1pcG1hcHMsXG5cdFx0XHRwcmVtdWx0aXBseUFscGhhOiB0aGlzLnByZW11bHRpcGx5QWxwaGEsXG5cdFx0XHR1bnBhY2tBbGlnbm1lbnQ6IHRoaXMudW5wYWNrQWxpZ25tZW50XG5cblx0XHR9O1xuXG5cdFx0aWYgKCBPYmplY3Qua2V5cyggdGhpcy51c2VyRGF0YSApLmxlbmd0aCA+IDAgKSBvdXRwdXQudXNlckRhdGEgPSB0aGlzLnVzZXJEYXRhO1xuXG5cdFx0aWYgKCAhIGlzUm9vdE9iamVjdCApIHtcblxuXHRcdFx0bWV0YS50ZXh0dXJlc1sgdGhpcy51dWlkIF0gPSBvdXRwdXQ7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0O1xuXG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KCB7IHR5cGU6ICdkaXNwb3NlJyB9ICk7XG5cblx0fVxuXG5cdHRyYW5zZm9ybVV2KCB1diApIHtcblxuXHRcdGlmICggdGhpcy5tYXBwaW5nICE9PSBVVk1hcHBpbmcgKSByZXR1cm4gdXY7XG5cblx0XHR1di5hcHBseU1hdHJpeDMoIHRoaXMubWF0cml4ICk7XG5cblx0XHRpZiAoIHV2LnggPCAwIHx8IHV2LnggPiAxICkge1xuXG5cdFx0XHRzd2l0Y2ggKCB0aGlzLndyYXBTICkge1xuXG5cdFx0XHRcdGNhc2UgUmVwZWF0V3JhcHBpbmc6XG5cblx0XHRcdFx0XHR1di54ID0gdXYueCAtIE1hdGguZmxvb3IoIHV2LnggKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIENsYW1wVG9FZGdlV3JhcHBpbmc6XG5cblx0XHRcdFx0XHR1di54ID0gdXYueCA8IDAgPyAwIDogMTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIE1pcnJvcmVkUmVwZWF0V3JhcHBpbmc6XG5cblx0XHRcdFx0XHRpZiAoIE1hdGguYWJzKCBNYXRoLmZsb29yKCB1di54ICkgJSAyICkgPT09IDEgKSB7XG5cblx0XHRcdFx0XHRcdHV2LnggPSBNYXRoLmNlaWwoIHV2LnggKSAtIHV2Lng7XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHR1di54ID0gdXYueCAtIE1hdGguZmxvb3IoIHV2LnggKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAoIHV2LnkgPCAwIHx8IHV2LnkgPiAxICkge1xuXG5cdFx0XHRzd2l0Y2ggKCB0aGlzLndyYXBUICkge1xuXG5cdFx0XHRcdGNhc2UgUmVwZWF0V3JhcHBpbmc6XG5cblx0XHRcdFx0XHR1di55ID0gdXYueSAtIE1hdGguZmxvb3IoIHV2LnkgKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIENsYW1wVG9FZGdlV3JhcHBpbmc6XG5cblx0XHRcdFx0XHR1di55ID0gdXYueSA8IDAgPyAwIDogMTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIE1pcnJvcmVkUmVwZWF0V3JhcHBpbmc6XG5cblx0XHRcdFx0XHRpZiAoIE1hdGguYWJzKCBNYXRoLmZsb29yKCB1di55ICkgJSAyICkgPT09IDEgKSB7XG5cblx0XHRcdFx0XHRcdHV2LnkgPSBNYXRoLmNlaWwoIHV2LnkgKSAtIHV2Lnk7XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHR1di55ID0gdXYueSAtIE1hdGguZmxvb3IoIHV2LnkgKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuZmxpcFkgKSB7XG5cblx0XHRcdHV2LnkgPSAxIC0gdXYueTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB1djtcblxuXHR9XG5cblx0c2V0IG5lZWRzVXBkYXRlKCB2YWx1ZSApIHtcblxuXHRcdGlmICggdmFsdWUgPT09IHRydWUgKSB7XG5cblx0XHRcdHRoaXMudmVyc2lvbiArKztcblx0XHRcdHRoaXMuc291cmNlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuXHRcdH1cblxuXHR9XG5cblx0Z2V0IGVuY29kaW5nKCkgeyAvLyBAZGVwcmVjYXRlZCwgcjE1MlxuXG5cdFx0d2Fybk9uY2UoICdUSFJFRS5UZXh0dXJlOiBQcm9wZXJ0eSAuZW5jb2RpbmcgaGFzIGJlZW4gcmVwbGFjZWQgYnkgLmNvbG9yU3BhY2UuJyApO1xuXHRcdHJldHVybiB0aGlzLmNvbG9yU3BhY2UgPT09IFNSR0JDb2xvclNwYWNlID8gc1JHQkVuY29kaW5nIDogTGluZWFyRW5jb2Rpbmc7XG5cblx0fVxuXG5cdHNldCBlbmNvZGluZyggZW5jb2RpbmcgKSB7IC8vIEBkZXByZWNhdGVkLCByMTUyXG5cblx0XHR3YXJuT25jZSggJ1RIUkVFLlRleHR1cmU6IFByb3BlcnR5IC5lbmNvZGluZyBoYXMgYmVlbiByZXBsYWNlZCBieSAuY29sb3JTcGFjZS4nICk7XG5cdFx0dGhpcy5jb2xvclNwYWNlID0gZW5jb2RpbmcgPT09IHNSR0JFbmNvZGluZyA/IFNSR0JDb2xvclNwYWNlIDogTm9Db2xvclNwYWNlO1xuXG5cdH1cblxufVxuXG5UZXh0dXJlLkRFRkFVTFRfSU1BR0UgPSBudWxsO1xuVGV4dHVyZS5ERUZBVUxUX01BUFBJTkcgPSBVVk1hcHBpbmc7XG5UZXh0dXJlLkRFRkFVTFRfQU5JU09UUk9QWSA9IDE7XG5cbmV4cG9ydCB7IFRleHR1cmUgfTtcbiIsImltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuL1RleHR1cmUuanMnO1xuaW1wb3J0IHsgTmVhcmVzdEZpbHRlciB9IGZyb20gJy4uL2NvbnN0YW50cy5qcyc7XG5cbmNsYXNzIERhdGFUZXh0dXJlIGV4dGVuZHMgVGV4dHVyZSB7XG5cblx0Y29uc3RydWN0b3IoIGRhdGEgPSBudWxsLCB3aWR0aCA9IDEsIGhlaWdodCA9IDEsIGZvcm1hdCwgdHlwZSwgbWFwcGluZywgd3JhcFMsIHdyYXBULCBtYWdGaWx0ZXIgPSBOZWFyZXN0RmlsdGVyLCBtaW5GaWx0ZXIgPSBOZWFyZXN0RmlsdGVyLCBhbmlzb3Ryb3B5LCBjb2xvclNwYWNlICkge1xuXG5cdFx0c3VwZXIoIG51bGwsIG1hcHBpbmcsIHdyYXBTLCB3cmFwVCwgbWFnRmlsdGVyLCBtaW5GaWx0ZXIsIGZvcm1hdCwgdHlwZSwgYW5pc290cm9weSwgY29sb3JTcGFjZSApO1xuXG5cdFx0dGhpcy5pc0RhdGFUZXh0dXJlID0gdHJ1ZTtcblxuXHRcdHRoaXMuaW1hZ2UgPSB7IGRhdGE6IGRhdGEsIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQgfTtcblxuXHRcdHRoaXMuZ2VuZXJhdGVNaXBtYXBzID0gZmFsc2U7XG5cdFx0dGhpcy5mbGlwWSA9IGZhbHNlO1xuXHRcdHRoaXMudW5wYWNrQWxpZ25tZW50ID0gMTtcblxuXHR9XG5cbn1cblxuZXhwb3J0IHsgRGF0YVRleHR1cmUgfTtcbiIsImltcG9ydCB7IExpbmVhckZpbHRlciwgTGluZWFyTWlwbWFwTGluZWFyRmlsdGVyLCBDbGFtcFRvRWRnZVdyYXBwaW5nIH0gZnJvbSAnLi4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IEZpbGVMb2FkZXIgfSBmcm9tICcuL0ZpbGVMb2FkZXIuanMnO1xuaW1wb3J0IHsgRGF0YVRleHR1cmUgfSBmcm9tICcuLi90ZXh0dXJlcy9EYXRhVGV4dHVyZS5qcyc7XG5pbXBvcnQgeyBMb2FkZXIgfSBmcm9tICcuL0xvYWRlci5qcyc7XG5cbi8qKlxuICogQWJzdHJhY3QgQmFzZSBjbGFzcyB0byBsb2FkIGdlbmVyaWMgYmluYXJ5IHRleHR1cmVzIGZvcm1hdHMgKHJnYmUsIGhkciwgLi4uKVxuICpcbiAqIFN1YiBjbGFzc2VzIGhhdmUgdG8gaW1wbGVtZW50IHRoZSBwYXJzZSgpIG1ldGhvZCB3aGljaCB3aWxsIGJlIHVzZWQgaW4gbG9hZCgpLlxuICovXG5cbmNsYXNzIERhdGFUZXh0dXJlTG9hZGVyIGV4dGVuZHMgTG9hZGVyIHtcblxuXHRjb25zdHJ1Y3RvciggbWFuYWdlciApIHtcblxuXHRcdHN1cGVyKCBtYW5hZ2VyICk7XG5cblx0fVxuXG5cdGxvYWQoIHVybCwgb25Mb2FkLCBvblByb2dyZXNzLCBvbkVycm9yICkge1xuXG5cdFx0Y29uc3Qgc2NvcGUgPSB0aGlzO1xuXG5cdFx0Y29uc3QgdGV4dHVyZSA9IG5ldyBEYXRhVGV4dHVyZSgpO1xuXG5cdFx0Y29uc3QgbG9hZGVyID0gbmV3IEZpbGVMb2FkZXIoIHRoaXMubWFuYWdlciApO1xuXHRcdGxvYWRlci5zZXRSZXNwb25zZVR5cGUoICdhcnJheWJ1ZmZlcicgKTtcblx0XHRsb2FkZXIuc2V0UmVxdWVzdEhlYWRlciggdGhpcy5yZXF1ZXN0SGVhZGVyICk7XG5cdFx0bG9hZGVyLnNldFBhdGgoIHRoaXMucGF0aCApO1xuXHRcdGxvYWRlci5zZXRXaXRoQ3JlZGVudGlhbHMoIHNjb3BlLndpdGhDcmVkZW50aWFscyApO1xuXHRcdGxvYWRlci5sb2FkKCB1cmwsIGZ1bmN0aW9uICggYnVmZmVyICkge1xuXG5cdFx0XHRjb25zdCB0ZXhEYXRhID0gc2NvcGUucGFyc2UoIGJ1ZmZlciApO1xuXG5cdFx0XHRpZiAoICEgdGV4RGF0YSApIHJldHVybjtcblxuXHRcdFx0aWYgKCB0ZXhEYXRhLmltYWdlICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0dGV4dHVyZS5pbWFnZSA9IHRleERhdGEuaW1hZ2U7XG5cblx0XHRcdH0gZWxzZSBpZiAoIHRleERhdGEuZGF0YSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdHRleHR1cmUuaW1hZ2Uud2lkdGggPSB0ZXhEYXRhLndpZHRoO1xuXHRcdFx0XHR0ZXh0dXJlLmltYWdlLmhlaWdodCA9IHRleERhdGEuaGVpZ2h0O1xuXHRcdFx0XHR0ZXh0dXJlLmltYWdlLmRhdGEgPSB0ZXhEYXRhLmRhdGE7XG5cblx0XHRcdH1cblxuXHRcdFx0dGV4dHVyZS53cmFwUyA9IHRleERhdGEud3JhcFMgIT09IHVuZGVmaW5lZCA/IHRleERhdGEud3JhcFMgOiBDbGFtcFRvRWRnZVdyYXBwaW5nO1xuXHRcdFx0dGV4dHVyZS53cmFwVCA9IHRleERhdGEud3JhcFQgIT09IHVuZGVmaW5lZCA/IHRleERhdGEud3JhcFQgOiBDbGFtcFRvRWRnZVdyYXBwaW5nO1xuXG5cdFx0XHR0ZXh0dXJlLm1hZ0ZpbHRlciA9IHRleERhdGEubWFnRmlsdGVyICE9PSB1bmRlZmluZWQgPyB0ZXhEYXRhLm1hZ0ZpbHRlciA6IExpbmVhckZpbHRlcjtcblx0XHRcdHRleHR1cmUubWluRmlsdGVyID0gdGV4RGF0YS5taW5GaWx0ZXIgIT09IHVuZGVmaW5lZCA/IHRleERhdGEubWluRmlsdGVyIDogTGluZWFyRmlsdGVyO1xuXG5cdFx0XHR0ZXh0dXJlLmFuaXNvdHJvcHkgPSB0ZXhEYXRhLmFuaXNvdHJvcHkgIT09IHVuZGVmaW5lZCA/IHRleERhdGEuYW5pc290cm9weSA6IDE7XG5cblx0XHRcdGlmICggdGV4RGF0YS5jb2xvclNwYWNlICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0dGV4dHVyZS5jb2xvclNwYWNlID0gdGV4RGF0YS5jb2xvclNwYWNlO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCB0ZXhEYXRhLmVuY29kaW5nICE9PSB1bmRlZmluZWQgKSB7IC8vIEBkZXByZWNhdGVkLCByMTUyXG5cblx0XHRcdFx0dGV4dHVyZS5lbmNvZGluZyA9IHRleERhdGEuZW5jb2Rpbmc7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCB0ZXhEYXRhLmZsaXBZICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0dGV4dHVyZS5mbGlwWSA9IHRleERhdGEuZmxpcFk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCB0ZXhEYXRhLmZvcm1hdCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdHRleHR1cmUuZm9ybWF0ID0gdGV4RGF0YS5mb3JtYXQ7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCB0ZXhEYXRhLnR5cGUgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHR0ZXh0dXJlLnR5cGUgPSB0ZXhEYXRhLnR5cGU7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCB0ZXhEYXRhLm1pcG1hcHMgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHR0ZXh0dXJlLm1pcG1hcHMgPSB0ZXhEYXRhLm1pcG1hcHM7XG5cdFx0XHRcdHRleHR1cmUubWluRmlsdGVyID0gTGluZWFyTWlwbWFwTGluZWFyRmlsdGVyOyAvLyBwcmVzdW1hYmx5Li4uXG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCB0ZXhEYXRhLm1pcG1hcENvdW50ID09PSAxICkge1xuXG5cdFx0XHRcdHRleHR1cmUubWluRmlsdGVyID0gTGluZWFyRmlsdGVyO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggdGV4RGF0YS5nZW5lcmF0ZU1pcG1hcHMgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHR0ZXh0dXJlLmdlbmVyYXRlTWlwbWFwcyA9IHRleERhdGEuZ2VuZXJhdGVNaXBtYXBzO1xuXG5cdFx0XHR9XG5cblx0XHRcdHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuXG5cdFx0XHRpZiAoIG9uTG9hZCApIG9uTG9hZCggdGV4dHVyZSwgdGV4RGF0YSApO1xuXG5cdFx0fSwgb25Qcm9ncmVzcywgb25FcnJvciApO1xuXG5cblx0XHRyZXR1cm4gdGV4dHVyZTtcblxuXHR9XG5cbn1cblxuXG5leHBvcnQgeyBEYXRhVGV4dHVyZUxvYWRlciB9O1xuIiwiaW1wb3J0IHsgY2xhbXAgfSBmcm9tICcuLi9tYXRoL01hdGhVdGlscy5qcyc7XG5cbi8vIEZhc3QgSGFsZiBGbG9hdCBDb252ZXJzaW9ucywgaHR0cDovL3d3dy5mb3gtdG9vbGtpdC5vcmcvZnRwL2Zhc3RoYWxmZmxvYXRjb252ZXJzaW9uLnBkZlxuXG5jb25zdCBfdGFibGVzID0gLypAX19QVVJFX18qLyBfZ2VuZXJhdGVUYWJsZXMoKTtcblxuZnVuY3Rpb24gX2dlbmVyYXRlVGFibGVzKCkge1xuXG5cdC8vIGZsb2F0MzIgdG8gZmxvYXQxNiBoZWxwZXJzXG5cblx0Y29uc3QgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKCA0ICk7XG5cdGNvbnN0IGZsb2F0VmlldyA9IG5ldyBGbG9hdDMyQXJyYXkoIGJ1ZmZlciApO1xuXHRjb25zdCB1aW50MzJWaWV3ID0gbmV3IFVpbnQzMkFycmF5KCBidWZmZXIgKTtcblxuXHRjb25zdCBiYXNlVGFibGUgPSBuZXcgVWludDMyQXJyYXkoIDUxMiApO1xuXHRjb25zdCBzaGlmdFRhYmxlID0gbmV3IFVpbnQzMkFycmF5KCA1MTIgKTtcblxuXHRmb3IgKCBsZXQgaSA9IDA7IGkgPCAyNTY7ICsrIGkgKSB7XG5cblx0XHRjb25zdCBlID0gaSAtIDEyNztcblxuXHRcdC8vIHZlcnkgc21hbGwgbnVtYmVyICgwLCAtMClcblxuXHRcdGlmICggZSA8IC0gMjcgKSB7XG5cblx0XHRcdGJhc2VUYWJsZVsgaSBdID0gMHgwMDAwO1xuXHRcdFx0YmFzZVRhYmxlWyBpIHwgMHgxMDAgXSA9IDB4ODAwMDtcblx0XHRcdHNoaWZ0VGFibGVbIGkgXSA9IDI0O1xuXHRcdFx0c2hpZnRUYWJsZVsgaSB8IDB4MTAwIF0gPSAyNDtcblxuXHRcdFx0Ly8gc21hbGwgbnVtYmVyIChkZW5vcm0pXG5cblx0XHR9IGVsc2UgaWYgKCBlIDwgLSAxNCApIHtcblxuXHRcdFx0YmFzZVRhYmxlWyBpIF0gPSAweDA0MDAgPj4gKCAtIGUgLSAxNCApO1xuXHRcdFx0YmFzZVRhYmxlWyBpIHwgMHgxMDAgXSA9ICggMHgwNDAwID4+ICggLSBlIC0gMTQgKSApIHwgMHg4MDAwO1xuXHRcdFx0c2hpZnRUYWJsZVsgaSBdID0gLSBlIC0gMTtcblx0XHRcdHNoaWZ0VGFibGVbIGkgfCAweDEwMCBdID0gLSBlIC0gMTtcblxuXHRcdFx0Ly8gbm9ybWFsIG51bWJlclxuXG5cdFx0fSBlbHNlIGlmICggZSA8PSAxNSApIHtcblxuXHRcdFx0YmFzZVRhYmxlWyBpIF0gPSAoIGUgKyAxNSApIDw8IDEwO1xuXHRcdFx0YmFzZVRhYmxlWyBpIHwgMHgxMDAgXSA9ICggKCBlICsgMTUgKSA8PCAxMCApIHwgMHg4MDAwO1xuXHRcdFx0c2hpZnRUYWJsZVsgaSBdID0gMTM7XG5cdFx0XHRzaGlmdFRhYmxlWyBpIHwgMHgxMDAgXSA9IDEzO1xuXG5cdFx0XHQvLyBsYXJnZSBudW1iZXIgKEluZmluaXR5LCAtSW5maW5pdHkpXG5cblx0XHR9IGVsc2UgaWYgKCBlIDwgMTI4ICkge1xuXG5cdFx0XHRiYXNlVGFibGVbIGkgXSA9IDB4N2MwMDtcblx0XHRcdGJhc2VUYWJsZVsgaSB8IDB4MTAwIF0gPSAweGZjMDA7XG5cdFx0XHRzaGlmdFRhYmxlWyBpIF0gPSAyNDtcblx0XHRcdHNoaWZ0VGFibGVbIGkgfCAweDEwMCBdID0gMjQ7XG5cblx0XHRcdC8vIHN0YXkgKE5hTiwgSW5maW5pdHksIC1JbmZpbml0eSlcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGJhc2VUYWJsZVsgaSBdID0gMHg3YzAwO1xuXHRcdFx0YmFzZVRhYmxlWyBpIHwgMHgxMDAgXSA9IDB4ZmMwMDtcblx0XHRcdHNoaWZ0VGFibGVbIGkgXSA9IDEzO1xuXHRcdFx0c2hpZnRUYWJsZVsgaSB8IDB4MTAwIF0gPSAxMztcblxuXHRcdH1cblxuXHR9XG5cblx0Ly8gZmxvYXQxNiB0byBmbG9hdDMyIGhlbHBlcnNcblxuXHRjb25zdCBtYW50aXNzYVRhYmxlID0gbmV3IFVpbnQzMkFycmF5KCAyMDQ4ICk7XG5cdGNvbnN0IGV4cG9uZW50VGFibGUgPSBuZXcgVWludDMyQXJyYXkoIDY0ICk7XG5cdGNvbnN0IG9mZnNldFRhYmxlID0gbmV3IFVpbnQzMkFycmF5KCA2NCApO1xuXG5cdGZvciAoIGxldCBpID0gMTsgaSA8IDEwMjQ7ICsrIGkgKSB7XG5cblx0XHRsZXQgbSA9IGkgPDwgMTM7IC8vIHplcm8gcGFkIG1hbnRpc3NhIGJpdHNcblx0XHRsZXQgZSA9IDA7IC8vIHplcm8gZXhwb25lbnRcblxuXHRcdC8vIG5vcm1hbGl6ZWRcblx0XHR3aGlsZSAoICggbSAmIDB4MDA4MDAwMDAgKSA9PT0gMCApIHtcblxuXHRcdFx0bSA8PD0gMTtcblx0XHRcdGUgLT0gMHgwMDgwMDAwMDsgLy8gZGVjcmVtZW50IGV4cG9uZW50XG5cblx0XHR9XG5cblx0XHRtICY9IH4gMHgwMDgwMDAwMDsgLy8gY2xlYXIgbGVhZGluZyAxIGJpdFxuXHRcdGUgKz0gMHgzODgwMDAwMDsgLy8gYWRqdXN0IGJpYXNcblxuXHRcdG1hbnRpc3NhVGFibGVbIGkgXSA9IG0gfCBlO1xuXG5cdH1cblxuXHRmb3IgKCBsZXQgaSA9IDEwMjQ7IGkgPCAyMDQ4OyArKyBpICkge1xuXG5cdFx0bWFudGlzc2FUYWJsZVsgaSBdID0gMHgzODAwMDAwMCArICggKCBpIC0gMTAyNCApIDw8IDEzICk7XG5cblx0fVxuXG5cdGZvciAoIGxldCBpID0gMTsgaSA8IDMxOyArKyBpICkge1xuXG5cdFx0ZXhwb25lbnRUYWJsZVsgaSBdID0gaSA8PCAyMztcblxuXHR9XG5cblx0ZXhwb25lbnRUYWJsZVsgMzEgXSA9IDB4NDc4MDAwMDA7XG5cdGV4cG9uZW50VGFibGVbIDMyIF0gPSAweDgwMDAwMDAwO1xuXG5cdGZvciAoIGxldCBpID0gMzM7IGkgPCA2MzsgKysgaSApIHtcblxuXHRcdGV4cG9uZW50VGFibGVbIGkgXSA9IDB4ODAwMDAwMDAgKyAoICggaSAtIDMyICkgPDwgMjMgKTtcblxuXHR9XG5cblx0ZXhwb25lbnRUYWJsZVsgNjMgXSA9IDB4Yzc4MDAwMDA7XG5cblx0Zm9yICggbGV0IGkgPSAxOyBpIDwgNjQ7ICsrIGkgKSB7XG5cblx0XHRpZiAoIGkgIT09IDMyICkge1xuXG5cdFx0XHRvZmZzZXRUYWJsZVsgaSBdID0gMTAyNDtcblxuXHRcdH1cblxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRmbG9hdFZpZXc6IGZsb2F0Vmlldyxcblx0XHR1aW50MzJWaWV3OiB1aW50MzJWaWV3LFxuXHRcdGJhc2VUYWJsZTogYmFzZVRhYmxlLFxuXHRcdHNoaWZ0VGFibGU6IHNoaWZ0VGFibGUsXG5cdFx0bWFudGlzc2FUYWJsZTogbWFudGlzc2FUYWJsZSxcblx0XHRleHBvbmVudFRhYmxlOiBleHBvbmVudFRhYmxlLFxuXHRcdG9mZnNldFRhYmxlOiBvZmZzZXRUYWJsZVxuXHR9O1xuXG59XG5cbi8vIGZsb2F0MzIgdG8gZmxvYXQxNlxuXG5mdW5jdGlvbiB0b0hhbGZGbG9hdCggdmFsICkge1xuXG5cdGlmICggTWF0aC5hYnMoIHZhbCApID4gNjU1MDQgKSBjb25zb2xlLndhcm4oICdUSFJFRS5EYXRhVXRpbHMudG9IYWxmRmxvYXQoKTogVmFsdWUgb3V0IG9mIHJhbmdlLicgKTtcblxuXHR2YWwgPSBjbGFtcCggdmFsLCAtIDY1NTA0LCA2NTUwNCApO1xuXG5cdF90YWJsZXMuZmxvYXRWaWV3WyAwIF0gPSB2YWw7XG5cdGNvbnN0IGYgPSBfdGFibGVzLnVpbnQzMlZpZXdbIDAgXTtcblx0Y29uc3QgZSA9ICggZiA+PiAyMyApICYgMHgxZmY7XG5cdHJldHVybiBfdGFibGVzLmJhc2VUYWJsZVsgZSBdICsgKCAoIGYgJiAweDAwN2ZmZmZmICkgPj4gX3RhYmxlcy5zaGlmdFRhYmxlWyBlIF0gKTtcblxufVxuXG4vLyBmbG9hdDE2IHRvIGZsb2F0MzJcblxuZnVuY3Rpb24gZnJvbUhhbGZGbG9hdCggdmFsICkge1xuXG5cdGNvbnN0IG0gPSB2YWwgPj4gMTA7XG5cdF90YWJsZXMudWludDMyVmlld1sgMCBdID0gX3RhYmxlcy5tYW50aXNzYVRhYmxlWyBfdGFibGVzLm9mZnNldFRhYmxlWyBtIF0gKyAoIHZhbCAmIDB4M2ZmICkgXSArIF90YWJsZXMuZXhwb25lbnRUYWJsZVsgbSBdO1xuXHRyZXR1cm4gX3RhYmxlcy5mbG9hdFZpZXdbIDAgXTtcblxufVxuXG5jb25zdCBEYXRhVXRpbHMgPSB7XG5cdHRvSGFsZkZsb2F0OiB0b0hhbGZGbG9hdCxcblx0ZnJvbUhhbGZGbG9hdDogZnJvbUhhbGZGbG9hdCxcbn07XG5cbmV4cG9ydCB7XG5cdHRvSGFsZkZsb2F0LFxuXHRmcm9tSGFsZkZsb2F0LFxuXHREYXRhVXRpbHNcbn07XG4iLCJpbXBvcnQge1xuXHREYXRhVGV4dHVyZUxvYWRlclxufSBmcm9tICcuLi8uLi8uLi9zcmMvbG9hZGVycy9EYXRhVGV4dHVyZUxvYWRlci5qcyc7XG5pbXBvcnQge1xuXHREYXRhVXRpbHNcbn0gZnJvbSAnLi4vLi4vLi4vc3JjL2V4dHJhcy9EYXRhVXRpbHMuanMnO1xuaW1wb3J0IHtcblx0RmxvYXRUeXBlLFxuXHRIYWxmRmxvYXRUeXBlLFxuXHRMaW5lYXJGaWx0ZXIsXG5cdExpbmVhclNSR0JDb2xvclNwYWNlXG59IGZyb20gJy4uLy4uLy4uL3NyYy9jb25zdGFudHMuanMnO1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9pc3N1ZXMvNTU1MlxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9SR0JFX2ltYWdlX2Zvcm1hdFxuXG5jbGFzcyBSR0JFTG9hZGVyIGV4dGVuZHMgRGF0YVRleHR1cmVMb2FkZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBtYW5hZ2VyICkge1xuXG5cdFx0c3VwZXIoIG1hbmFnZXIgKTtcblxuXHRcdHRoaXMudHlwZSA9IEhhbGZGbG9hdFR5cGU7XG5cblx0fVxuXG5cdC8vIGFkYXB0ZWQgZnJvbSBodHRwOi8vd3d3LmdyYXBoaWNzLmNvcm5lbGwuZWR1L35iancvcmdiZS5odG1sXG5cblx0cGFyc2UoIGJ1ZmZlciApIHtcblxuXHRcdGNvbnN0XG5cdFx0XHQvKiByZXR1cm4gY29kZXMgZm9yIHJnYmUgcm91dGluZXMgKi9cblx0XHRcdC8vUkdCRV9SRVRVUk5fU1VDQ0VTUyA9IDAsXG5cdFx0XHRSR0JFX1JFVFVSTl9GQUlMVVJFID0gLSAxLFxuXG5cdFx0XHQvKiBkZWZhdWx0IGVycm9yIHJvdXRpbmUuICBjaGFuZ2UgdGhpcyB0byBjaGFuZ2UgZXJyb3IgaGFuZGxpbmcgKi9cblx0XHRcdHJnYmVfcmVhZF9lcnJvciA9IDEsXG5cdFx0XHRyZ2JlX3dyaXRlX2Vycm9yID0gMixcblx0XHRcdHJnYmVfZm9ybWF0X2Vycm9yID0gMyxcblx0XHRcdHJnYmVfbWVtb3J5X2Vycm9yID0gNCxcblx0XHRcdHJnYmVfZXJyb3IgPSBmdW5jdGlvbiAoIHJnYmVfZXJyb3JfY29kZSwgbXNnICkge1xuXG5cdFx0XHRcdHN3aXRjaCAoIHJnYmVfZXJyb3JfY29kZSApIHtcblxuXHRcdFx0XHRcdGNhc2UgcmdiZV9yZWFkX2Vycm9yOiBjb25zb2xlLmVycm9yKCAnVEhSRUUuUkdCRUxvYWRlciBSZWFkIEVycm9yOiAnICsgKCBtc2cgfHwgJycgKSApO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSByZ2JlX3dyaXRlX2Vycm9yOiBjb25zb2xlLmVycm9yKCAnVEhSRUUuUkdCRUxvYWRlciBXcml0ZSBFcnJvcjogJyArICggbXNnIHx8ICcnICkgKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgcmdiZV9mb3JtYXRfZXJyb3I6IGNvbnNvbGUuZXJyb3IoICdUSFJFRS5SR0JFTG9hZGVyIEJhZCBGaWxlIEZvcm1hdDogJyArICggbXNnIHx8ICcnICkgKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Y2FzZSByZ2JlX21lbW9yeV9lcnJvcjogY29uc29sZS5lcnJvciggJ1RIUkVFLlJHQkVMb2FkZXI6IEVycm9yOiAnICsgKCBtc2cgfHwgJycgKSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gUkdCRV9SRVRVUk5fRkFJTFVSRTtcblxuXHRcdFx0fSxcblxuXHRcdFx0Lyogb2Zmc2V0cyB0byByZWQsIGdyZWVuLCBhbmQgYmx1ZSBjb21wb25lbnRzIGluIGEgZGF0YSAoZmxvYXQpIHBpeGVsICovXG5cdFx0XHQvL1JHQkVfREFUQV9SRUQgPSAwLFxuXHRcdFx0Ly9SR0JFX0RBVEFfR1JFRU4gPSAxLFxuXHRcdFx0Ly9SR0JFX0RBVEFfQkxVRSA9IDIsXG5cblx0XHRcdC8qIG51bWJlciBvZiBmbG9hdHMgcGVyIHBpeGVsLCB1c2UgNCBzaW5jZSBzdG9yZWQgaW4gcmdiYSBpbWFnZSBmb3JtYXQgKi9cblx0XHRcdC8vUkdCRV9EQVRBX1NJWkUgPSA0LFxuXG5cdFx0XHQvKiBmbGFncyBpbmRpY2F0aW5nIHdoaWNoIGZpZWxkcyBpbiBhbiByZ2JlX2hlYWRlcl9pbmZvIGFyZSB2YWxpZCAqL1xuXHRcdFx0UkdCRV9WQUxJRF9QUk9HUkFNVFlQRSA9IDEsXG5cdFx0XHRSR0JFX1ZBTElEX0ZPUk1BVCA9IDIsXG5cdFx0XHRSR0JFX1ZBTElEX0RJTUVOU0lPTlMgPSA0LFxuXG5cdFx0XHRORVdMSU5FID0gJ1xcbicsXG5cblx0XHRcdGZnZXRzID0gZnVuY3Rpb24gKCBidWZmZXIsIGxpbmVMaW1pdCwgY29uc3VtZSApIHtcblxuXHRcdFx0XHRjb25zdCBjaHVua1NpemUgPSAxMjg7XG5cblx0XHRcdFx0bGluZUxpbWl0ID0gISBsaW5lTGltaXQgPyAxMDI0IDogbGluZUxpbWl0O1xuXHRcdFx0XHRsZXQgcCA9IGJ1ZmZlci5wb3MsXG5cdFx0XHRcdFx0aSA9IC0gMSwgbGVuID0gMCwgcyA9ICcnLFxuXHRcdFx0XHRcdGNodW5rID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseSggbnVsbCwgbmV3IFVpbnQxNkFycmF5KCBidWZmZXIuc3ViYXJyYXkoIHAsIHAgKyBjaHVua1NpemUgKSApICk7XG5cblx0XHRcdFx0d2hpbGUgKCAoIDAgPiAoIGkgPSBjaHVuay5pbmRleE9mKCBORVdMSU5FICkgKSApICYmICggbGVuIDwgbGluZUxpbWl0ICkgJiYgKCBwIDwgYnVmZmVyLmJ5dGVMZW5ndGggKSApIHtcblxuXHRcdFx0XHRcdHMgKz0gY2h1bms7IGxlbiArPSBjaHVuay5sZW5ndGg7XG5cdFx0XHRcdFx0cCArPSBjaHVua1NpemU7XG5cdFx0XHRcdFx0Y2h1bmsgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseSggbnVsbCwgbmV3IFVpbnQxNkFycmF5KCBidWZmZXIuc3ViYXJyYXkoIHAsIHAgKyBjaHVua1NpemUgKSApICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggLSAxIDwgaSApIHtcblxuXHRcdFx0XHRcdC8qZm9yIChpPWwtMTsgaT49MDsgaS0tKSB7XG5cdFx0XHRcdFx0XHRieXRlQ29kZSA9IG0uY2hhckNvZGVBdChpKTtcblx0XHRcdFx0XHRcdGlmIChieXRlQ29kZSA+IDB4N2YgJiYgYnl0ZUNvZGUgPD0gMHg3ZmYpIGJ5dGVMZW4rKztcblx0XHRcdFx0XHRcdGVsc2UgaWYgKGJ5dGVDb2RlID4gMHg3ZmYgJiYgYnl0ZUNvZGUgPD0gMHhmZmZmKSBieXRlTGVuICs9IDI7XG5cdFx0XHRcdFx0XHRpZiAoYnl0ZUNvZGUgPj0gMHhEQzAwICYmIGJ5dGVDb2RlIDw9IDB4REZGRikgaS0tOyAvL3RyYWlsIHN1cnJvZ2F0ZVxuXHRcdFx0XHRcdH0qL1xuXHRcdFx0XHRcdGlmICggZmFsc2UgIT09IGNvbnN1bWUgKSBidWZmZXIucG9zICs9IGxlbiArIGkgKyAxO1xuXHRcdFx0XHRcdHJldHVybiBzICsgY2h1bmsuc2xpY2UoIDAsIGkgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0XHR9LFxuXG5cdFx0XHQvKiBtaW5pbWFsIGhlYWRlciByZWFkaW5nLiAgbW9kaWZ5IGlmIHlvdSB3YW50IHRvIHBhcnNlIG1vcmUgaW5mb3JtYXRpb24gKi9cblx0XHRcdFJHQkVfUmVhZEhlYWRlciA9IGZ1bmN0aW9uICggYnVmZmVyICkge1xuXG5cblx0XHRcdFx0Ly8gcmVnZXhlcyB0byBwYXJzZSBoZWFkZXIgaW5mbyBmaWVsZHNcblx0XHRcdFx0Y29uc3QgbWFnaWNfdG9rZW5fcmUgPSAvXiNcXD8oXFxTKykvLFxuXHRcdFx0XHRcdGdhbW1hX3JlID0gL15cXHMqR0FNTUFcXHMqPVxccyooXFxkKyhcXC5cXGQrKT8pXFxzKiQvLFxuXHRcdFx0XHRcdGV4cG9zdXJlX3JlID0gL15cXHMqRVhQT1NVUkVcXHMqPVxccyooXFxkKyhcXC5cXGQrKT8pXFxzKiQvLFxuXHRcdFx0XHRcdGZvcm1hdF9yZSA9IC9eXFxzKkZPUk1BVD0oXFxTKylcXHMqJC8sXG5cdFx0XHRcdFx0ZGltZW5zaW9uc19yZSA9IC9eXFxzKlxcLVlcXHMrKFxcZCspXFxzK1xcK1hcXHMrKFxcZCspXFxzKiQvLFxuXG5cdFx0XHRcdFx0Ly8gUkdCRSBmb3JtYXQgaGVhZGVyIHN0cnVjdFxuXHRcdFx0XHRcdGhlYWRlciA9IHtcblxuXHRcdFx0XHRcdFx0dmFsaWQ6IDAsIC8qIGluZGljYXRlIHdoaWNoIGZpZWxkcyBhcmUgdmFsaWQgKi9cblxuXHRcdFx0XHRcdFx0c3RyaW5nOiAnJywgLyogdGhlIGFjdHVhbCBoZWFkZXIgc3RyaW5nICovXG5cblx0XHRcdFx0XHRcdGNvbW1lbnRzOiAnJywgLyogY29tbWVudHMgZm91bmQgaW4gaGVhZGVyICovXG5cblx0XHRcdFx0XHRcdHByb2dyYW10eXBlOiAnUkdCRScsIC8qIGxpc3RlZCBhdCBiZWdpbm5pbmcgb2YgZmlsZSB0byBpZGVudGlmeSBpdCBhZnRlciBcIiM/XCIuIGRlZmF1bHRzIHRvIFwiUkdCRVwiICovXG5cblx0XHRcdFx0XHRcdGZvcm1hdDogJycsIC8qIFJHQkUgZm9ybWF0LCBkZWZhdWx0IDMyLWJpdF9ybGVfcmdiZSAqL1xuXG5cdFx0XHRcdFx0XHRnYW1tYTogMS4wLCAvKiBpbWFnZSBoYXMgYWxyZWFkeSBiZWVuIGdhbW1hIGNvcnJlY3RlZCB3aXRoIGdpdmVuIGdhbW1hLiBkZWZhdWx0cyB0byAxLjAgKG5vIGNvcnJlY3Rpb24pICovXG5cblx0XHRcdFx0XHRcdGV4cG9zdXJlOiAxLjAsIC8qIGEgdmFsdWUgb2YgMS4wIGluIGFuIGltYWdlIGNvcnJlc3BvbmRzIHRvIDxleHBvc3VyZT4gd2F0dHMvc3RlcmFkaWFuL21eMi4gZGVmYXVsdHMgdG8gMS4wICovXG5cblx0XHRcdFx0XHRcdHdpZHRoOiAwLCBoZWlnaHQ6IDAgLyogaW1hZ2UgZGltZW5zaW9ucywgd2lkdGgvaGVpZ2h0ICovXG5cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdGxldCBsaW5lLCBtYXRjaDtcblxuXHRcdFx0XHRpZiAoIGJ1ZmZlci5wb3MgPj0gYnVmZmVyLmJ5dGVMZW5ndGggfHwgISAoIGxpbmUgPSBmZ2V0cyggYnVmZmVyICkgKSApIHtcblxuXHRcdFx0XHRcdHJldHVybiByZ2JlX2Vycm9yKCByZ2JlX3JlYWRfZXJyb3IsICdubyBoZWFkZXIgZm91bmQnICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8qIGlmIHlvdSB3YW50IHRvIHJlcXVpcmUgdGhlIG1hZ2ljIHRva2VuIHRoZW4gdW5jb21tZW50IHRoZSBuZXh0IGxpbmUgKi9cblx0XHRcdFx0aWYgKCAhICggbWF0Y2ggPSBsaW5lLm1hdGNoKCBtYWdpY190b2tlbl9yZSApICkgKSB7XG5cblx0XHRcdFx0XHRyZXR1cm4gcmdiZV9lcnJvciggcmdiZV9mb3JtYXRfZXJyb3IsICdiYWQgaW5pdGlhbCB0b2tlbicgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aGVhZGVyLnZhbGlkIHw9IFJHQkVfVkFMSURfUFJPR1JBTVRZUEU7XG5cdFx0XHRcdGhlYWRlci5wcm9ncmFtdHlwZSA9IG1hdGNoWyAxIF07XG5cdFx0XHRcdGhlYWRlci5zdHJpbmcgKz0gbGluZSArICdcXG4nO1xuXG5cdFx0XHRcdHdoaWxlICggdHJ1ZSApIHtcblxuXHRcdFx0XHRcdGxpbmUgPSBmZ2V0cyggYnVmZmVyICk7XG5cdFx0XHRcdFx0aWYgKCBmYWxzZSA9PT0gbGluZSApIGJyZWFrO1xuXHRcdFx0XHRcdGhlYWRlci5zdHJpbmcgKz0gbGluZSArICdcXG4nO1xuXG5cdFx0XHRcdFx0aWYgKCAnIycgPT09IGxpbmUuY2hhckF0KCAwICkgKSB7XG5cblx0XHRcdFx0XHRcdGhlYWRlci5jb21tZW50cyArPSBsaW5lICsgJ1xcbic7XG5cdFx0XHRcdFx0XHRjb250aW51ZTsgLy8gY29tbWVudCBsaW5lXG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIG1hdGNoID0gbGluZS5tYXRjaCggZ2FtbWFfcmUgKSApIHtcblxuXHRcdFx0XHRcdFx0aGVhZGVyLmdhbW1hID0gcGFyc2VGbG9hdCggbWF0Y2hbIDEgXSApO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCBtYXRjaCA9IGxpbmUubWF0Y2goIGV4cG9zdXJlX3JlICkgKSB7XG5cblx0XHRcdFx0XHRcdGhlYWRlci5leHBvc3VyZSA9IHBhcnNlRmxvYXQoIG1hdGNoWyAxIF0gKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggbWF0Y2ggPSBsaW5lLm1hdGNoKCBmb3JtYXRfcmUgKSApIHtcblxuXHRcdFx0XHRcdFx0aGVhZGVyLnZhbGlkIHw9IFJHQkVfVkFMSURfRk9STUFUO1xuXHRcdFx0XHRcdFx0aGVhZGVyLmZvcm1hdCA9IG1hdGNoWyAxIF07Ly8nMzItYml0X3JsZV9yZ2JlJztcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggbWF0Y2ggPSBsaW5lLm1hdGNoKCBkaW1lbnNpb25zX3JlICkgKSB7XG5cblx0XHRcdFx0XHRcdGhlYWRlci52YWxpZCB8PSBSR0JFX1ZBTElEX0RJTUVOU0lPTlM7XG5cdFx0XHRcdFx0XHRoZWFkZXIuaGVpZ2h0ID0gcGFyc2VJbnQoIG1hdGNoWyAxIF0sIDEwICk7XG5cdFx0XHRcdFx0XHRoZWFkZXIud2lkdGggPSBwYXJzZUludCggbWF0Y2hbIDIgXSwgMTAgKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggKCBoZWFkZXIudmFsaWQgJiBSR0JFX1ZBTElEX0ZPUk1BVCApICYmICggaGVhZGVyLnZhbGlkICYgUkdCRV9WQUxJRF9ESU1FTlNJT05TICkgKSBicmVhaztcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCAhICggaGVhZGVyLnZhbGlkICYgUkdCRV9WQUxJRF9GT1JNQVQgKSApIHtcblxuXHRcdFx0XHRcdHJldHVybiByZ2JlX2Vycm9yKCByZ2JlX2Zvcm1hdF9lcnJvciwgJ21pc3NpbmcgZm9ybWF0IHNwZWNpZmllcicgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCAhICggaGVhZGVyLnZhbGlkICYgUkdCRV9WQUxJRF9ESU1FTlNJT05TICkgKSB7XG5cblx0XHRcdFx0XHRyZXR1cm4gcmdiZV9lcnJvciggcmdiZV9mb3JtYXRfZXJyb3IsICdtaXNzaW5nIGltYWdlIHNpemUgc3BlY2lmaWVyJyApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gaGVhZGVyO1xuXG5cdFx0XHR9LFxuXG5cdFx0XHRSR0JFX1JlYWRQaXhlbHNfUkxFID0gZnVuY3Rpb24gKCBidWZmZXIsIHcsIGggKSB7XG5cblx0XHRcdFx0Y29uc3Qgc2NhbmxpbmVfd2lkdGggPSB3O1xuXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHQvLyBydW4gbGVuZ3RoIGVuY29kaW5nIGlzIG5vdCBhbGxvd2VkIHNvIHJlYWQgZmxhdFxuXHRcdFx0XHRcdCggKCBzY2FubGluZV93aWR0aCA8IDggKSB8fCAoIHNjYW5saW5lX3dpZHRoID4gMHg3ZmZmICkgKSB8fFxuXHRcdFx0XHRcdC8vIHRoaXMgZmlsZSBpcyBub3QgcnVuIGxlbmd0aCBlbmNvZGVkXG5cdFx0XHRcdFx0KCAoIDIgIT09IGJ1ZmZlclsgMCBdICkgfHwgKCAyICE9PSBidWZmZXJbIDEgXSApIHx8ICggYnVmZmVyWyAyIF0gJiAweDgwICkgKVxuXHRcdFx0XHQpIHtcblxuXHRcdFx0XHRcdC8vIHJldHVybiB0aGUgZmxhdCBidWZmZXJcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoIGJ1ZmZlciApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIHNjYW5saW5lX3dpZHRoICE9PSAoICggYnVmZmVyWyAyIF0gPDwgOCApIHwgYnVmZmVyWyAzIF0gKSApIHtcblxuXHRcdFx0XHRcdHJldHVybiByZ2JlX2Vycm9yKCByZ2JlX2Zvcm1hdF9lcnJvciwgJ3dyb25nIHNjYW5saW5lIHdpZHRoJyApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBkYXRhX3JnYmEgPSBuZXcgVWludDhBcnJheSggNCAqIHcgKiBoICk7XG5cblx0XHRcdFx0aWYgKCAhIGRhdGFfcmdiYS5sZW5ndGggKSB7XG5cblx0XHRcdFx0XHRyZXR1cm4gcmdiZV9lcnJvciggcmdiZV9tZW1vcnlfZXJyb3IsICd1bmFibGUgdG8gYWxsb2NhdGUgYnVmZmVyIHNwYWNlJyApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgb2Zmc2V0ID0gMCwgcG9zID0gMDtcblxuXHRcdFx0XHRjb25zdCBwdHJfZW5kID0gNCAqIHNjYW5saW5lX3dpZHRoO1xuXHRcdFx0XHRjb25zdCByZ2JlU3RhcnQgPSBuZXcgVWludDhBcnJheSggNCApO1xuXHRcdFx0XHRjb25zdCBzY2FubGluZV9idWZmZXIgPSBuZXcgVWludDhBcnJheSggcHRyX2VuZCApO1xuXHRcdFx0XHRsZXQgbnVtX3NjYW5saW5lcyA9IGg7XG5cblx0XHRcdFx0Ly8gcmVhZCBpbiBlYWNoIHN1Y2Nlc3NpdmUgc2NhbmxpbmVcblx0XHRcdFx0d2hpbGUgKCAoIG51bV9zY2FubGluZXMgPiAwICkgJiYgKCBwb3MgPCBidWZmZXIuYnl0ZUxlbmd0aCApICkge1xuXG5cdFx0XHRcdFx0aWYgKCBwb3MgKyA0ID4gYnVmZmVyLmJ5dGVMZW5ndGggKSB7XG5cblx0XHRcdFx0XHRcdHJldHVybiByZ2JlX2Vycm9yKCByZ2JlX3JlYWRfZXJyb3IgKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJnYmVTdGFydFsgMCBdID0gYnVmZmVyWyBwb3MgKysgXTtcblx0XHRcdFx0XHRyZ2JlU3RhcnRbIDEgXSA9IGJ1ZmZlclsgcG9zICsrIF07XG5cdFx0XHRcdFx0cmdiZVN0YXJ0WyAyIF0gPSBidWZmZXJbIHBvcyArKyBdO1xuXHRcdFx0XHRcdHJnYmVTdGFydFsgMyBdID0gYnVmZmVyWyBwb3MgKysgXTtcblxuXHRcdFx0XHRcdGlmICggKCAyICE9IHJnYmVTdGFydFsgMCBdICkgfHwgKCAyICE9IHJnYmVTdGFydFsgMSBdICkgfHwgKCAoICggcmdiZVN0YXJ0WyAyIF0gPDwgOCApIHwgcmdiZVN0YXJ0WyAzIF0gKSAhPSBzY2FubGluZV93aWR0aCApICkge1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gcmdiZV9lcnJvciggcmdiZV9mb3JtYXRfZXJyb3IsICdiYWQgcmdiZSBzY2FubGluZSBmb3JtYXQnICk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyByZWFkIGVhY2ggb2YgdGhlIGZvdXIgY2hhbm5lbHMgZm9yIHRoZSBzY2FubGluZSBpbnRvIHRoZSBidWZmZXJcblx0XHRcdFx0XHQvLyBmaXJzdCByZWQsIHRoZW4gZ3JlZW4sIHRoZW4gYmx1ZSwgdGhlbiBleHBvbmVudFxuXHRcdFx0XHRcdGxldCBwdHIgPSAwLCBjb3VudDtcblxuXHRcdFx0XHRcdHdoaWxlICggKCBwdHIgPCBwdHJfZW5kICkgJiYgKCBwb3MgPCBidWZmZXIuYnl0ZUxlbmd0aCApICkge1xuXG5cdFx0XHRcdFx0XHRjb3VudCA9IGJ1ZmZlclsgcG9zICsrIF07XG5cdFx0XHRcdFx0XHRjb25zdCBpc0VuY29kZWRSdW4gPSBjb3VudCA+IDEyODtcblx0XHRcdFx0XHRcdGlmICggaXNFbmNvZGVkUnVuICkgY291bnQgLT0gMTI4O1xuXG5cdFx0XHRcdFx0XHRpZiAoICggMCA9PT0gY291bnQgKSB8fCAoIHB0ciArIGNvdW50ID4gcHRyX2VuZCApICkge1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZ2JlX2Vycm9yKCByZ2JlX2Zvcm1hdF9lcnJvciwgJ2JhZCBzY2FubGluZSBkYXRhJyApO1xuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICggaXNFbmNvZGVkUnVuICkge1xuXG5cdFx0XHRcdFx0XHRcdC8vIGEgKGVuY29kZWQpIHJ1biBvZiB0aGUgc2FtZSB2YWx1ZVxuXHRcdFx0XHRcdFx0XHRjb25zdCBieXRlVmFsdWUgPSBidWZmZXJbIHBvcyArKyBdO1xuXHRcdFx0XHRcdFx0XHRmb3IgKCBsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSArKyApIHtcblxuXHRcdFx0XHRcdFx0XHRcdHNjYW5saW5lX2J1ZmZlclsgcHRyICsrIF0gPSBieXRlVmFsdWU7XG5cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQvL3B0ciArPSBjb3VudDtcblxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0XHQvLyBhIGxpdGVyYWwtcnVuXG5cdFx0XHRcdFx0XHRcdHNjYW5saW5lX2J1ZmZlci5zZXQoIGJ1ZmZlci5zdWJhcnJheSggcG9zLCBwb3MgKyBjb3VudCApLCBwdHIgKTtcblx0XHRcdFx0XHRcdFx0cHRyICs9IGNvdW50OyBwb3MgKz0gY291bnQ7XG5cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH1cblxuXG5cdFx0XHRcdFx0Ly8gbm93IGNvbnZlcnQgZGF0YSBmcm9tIGJ1ZmZlciBpbnRvIHJnYmFcblx0XHRcdFx0XHQvLyBmaXJzdCByZWQsIHRoZW4gZ3JlZW4sIHRoZW4gYmx1ZSwgdGhlbiBleHBvbmVudCAoYWxwaGEpXG5cdFx0XHRcdFx0Y29uc3QgbCA9IHNjYW5saW5lX3dpZHRoOyAvL3NjYW5saW5lX2J1ZmZlci5ieXRlTGVuZ3RoO1xuXHRcdFx0XHRcdGZvciAoIGxldCBpID0gMDsgaSA8IGw7IGkgKysgKSB7XG5cblx0XHRcdFx0XHRcdGxldCBvZmYgPSAwO1xuXHRcdFx0XHRcdFx0ZGF0YV9yZ2JhWyBvZmZzZXQgXSA9IHNjYW5saW5lX2J1ZmZlclsgaSArIG9mZiBdO1xuXHRcdFx0XHRcdFx0b2ZmICs9IHNjYW5saW5lX3dpZHRoOyAvLzE7XG5cdFx0XHRcdFx0XHRkYXRhX3JnYmFbIG9mZnNldCArIDEgXSA9IHNjYW5saW5lX2J1ZmZlclsgaSArIG9mZiBdO1xuXHRcdFx0XHRcdFx0b2ZmICs9IHNjYW5saW5lX3dpZHRoOyAvLzE7XG5cdFx0XHRcdFx0XHRkYXRhX3JnYmFbIG9mZnNldCArIDIgXSA9IHNjYW5saW5lX2J1ZmZlclsgaSArIG9mZiBdO1xuXHRcdFx0XHRcdFx0b2ZmICs9IHNjYW5saW5lX3dpZHRoOyAvLzE7XG5cdFx0XHRcdFx0XHRkYXRhX3JnYmFbIG9mZnNldCArIDMgXSA9IHNjYW5saW5lX2J1ZmZlclsgaSArIG9mZiBdO1xuXHRcdFx0XHRcdFx0b2Zmc2V0ICs9IDQ7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRudW1fc2NhbmxpbmVzIC0tO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gZGF0YV9yZ2JhO1xuXG5cdFx0XHR9O1xuXG5cdFx0Y29uc3QgUkdCRUJ5dGVUb1JHQkZsb2F0ID0gZnVuY3Rpb24gKCBzb3VyY2VBcnJheSwgc291cmNlT2Zmc2V0LCBkZXN0QXJyYXksIGRlc3RPZmZzZXQgKSB7XG5cblx0XHRcdGNvbnN0IGUgPSBzb3VyY2VBcnJheVsgc291cmNlT2Zmc2V0ICsgMyBdO1xuXHRcdFx0Y29uc3Qgc2NhbGUgPSBNYXRoLnBvdyggMi4wLCBlIC0gMTI4LjAgKSAvIDI1NS4wO1xuXG5cdFx0XHRkZXN0QXJyYXlbIGRlc3RPZmZzZXQgKyAwIF0gPSBzb3VyY2VBcnJheVsgc291cmNlT2Zmc2V0ICsgMCBdICogc2NhbGU7XG5cdFx0XHRkZXN0QXJyYXlbIGRlc3RPZmZzZXQgKyAxIF0gPSBzb3VyY2VBcnJheVsgc291cmNlT2Zmc2V0ICsgMSBdICogc2NhbGU7XG5cdFx0XHRkZXN0QXJyYXlbIGRlc3RPZmZzZXQgKyAyIF0gPSBzb3VyY2VBcnJheVsgc291cmNlT2Zmc2V0ICsgMiBdICogc2NhbGU7XG5cdFx0XHRkZXN0QXJyYXlbIGRlc3RPZmZzZXQgKyAzIF0gPSAxO1xuXG5cdFx0fTtcblxuXHRcdGNvbnN0IFJHQkVCeXRlVG9SR0JIYWxmID0gZnVuY3Rpb24gKCBzb3VyY2VBcnJheSwgc291cmNlT2Zmc2V0LCBkZXN0QXJyYXksIGRlc3RPZmZzZXQgKSB7XG5cblx0XHRcdGNvbnN0IGUgPSBzb3VyY2VBcnJheVsgc291cmNlT2Zmc2V0ICsgMyBdO1xuXHRcdFx0Y29uc3Qgc2NhbGUgPSBNYXRoLnBvdyggMi4wLCBlIC0gMTI4LjAgKSAvIDI1NS4wO1xuXG5cdFx0XHQvLyBjbGFtcGluZyB0byA2NTUwNCwgdGhlIG1heGltdW0gcmVwcmVzZW50YWJsZSB2YWx1ZSBpbiBmbG9hdDE2XG5cdFx0XHRkZXN0QXJyYXlbIGRlc3RPZmZzZXQgKyAwIF0gPSBEYXRhVXRpbHMudG9IYWxmRmxvYXQoIE1hdGgubWluKCBzb3VyY2VBcnJheVsgc291cmNlT2Zmc2V0ICsgMCBdICogc2NhbGUsIDY1NTA0ICkgKTtcblx0XHRcdGRlc3RBcnJheVsgZGVzdE9mZnNldCArIDEgXSA9IERhdGFVdGlscy50b0hhbGZGbG9hdCggTWF0aC5taW4oIHNvdXJjZUFycmF5WyBzb3VyY2VPZmZzZXQgKyAxIF0gKiBzY2FsZSwgNjU1MDQgKSApO1xuXHRcdFx0ZGVzdEFycmF5WyBkZXN0T2Zmc2V0ICsgMiBdID0gRGF0YVV0aWxzLnRvSGFsZkZsb2F0KCBNYXRoLm1pbiggc291cmNlQXJyYXlbIHNvdXJjZU9mZnNldCArIDIgXSAqIHNjYWxlLCA2NTUwNCApICk7XG5cdFx0XHRkZXN0QXJyYXlbIGRlc3RPZmZzZXQgKyAzIF0gPSBEYXRhVXRpbHMudG9IYWxmRmxvYXQoIDEgKTtcblxuXHRcdH07XG5cblx0XHRjb25zdCBieXRlQXJyYXkgPSBuZXcgVWludDhBcnJheSggYnVmZmVyICk7XG5cdFx0Ynl0ZUFycmF5LnBvcyA9IDA7XG5cdFx0Y29uc3QgcmdiZV9oZWFkZXJfaW5mbyA9IFJHQkVfUmVhZEhlYWRlciggYnl0ZUFycmF5ICk7XG5cblx0XHRpZiAoIFJHQkVfUkVUVVJOX0ZBSUxVUkUgIT09IHJnYmVfaGVhZGVyX2luZm8gKSB7XG5cblx0XHRcdGNvbnN0IHcgPSByZ2JlX2hlYWRlcl9pbmZvLndpZHRoLFxuXHRcdFx0XHRoID0gcmdiZV9oZWFkZXJfaW5mby5oZWlnaHQsXG5cdFx0XHRcdGltYWdlX3JnYmFfZGF0YSA9IFJHQkVfUmVhZFBpeGVsc19STEUoIGJ5dGVBcnJheS5zdWJhcnJheSggYnl0ZUFycmF5LnBvcyApLCB3LCBoICk7XG5cblx0XHRcdGlmICggUkdCRV9SRVRVUk5fRkFJTFVSRSAhPT0gaW1hZ2VfcmdiYV9kYXRhICkge1xuXG5cdFx0XHRcdGxldCBkYXRhLCB0eXBlO1xuXHRcdFx0XHRsZXQgbnVtRWxlbWVudHM7XG5cblx0XHRcdFx0c3dpdGNoICggdGhpcy50eXBlICkge1xuXG5cdFx0XHRcdFx0Y2FzZSBGbG9hdFR5cGU6XG5cblx0XHRcdFx0XHRcdG51bUVsZW1lbnRzID0gaW1hZ2VfcmdiYV9kYXRhLmxlbmd0aCAvIDQ7XG5cdFx0XHRcdFx0XHRjb25zdCBmbG9hdEFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSggbnVtRWxlbWVudHMgKiA0ICk7XG5cblx0XHRcdFx0XHRcdGZvciAoIGxldCBqID0gMDsgaiA8IG51bUVsZW1lbnRzOyBqICsrICkge1xuXG5cdFx0XHRcdFx0XHRcdFJHQkVCeXRlVG9SR0JGbG9hdCggaW1hZ2VfcmdiYV9kYXRhLCBqICogNCwgZmxvYXRBcnJheSwgaiAqIDQgKTtcblxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRkYXRhID0gZmxvYXRBcnJheTtcblx0XHRcdFx0XHRcdHR5cGUgPSBGbG9hdFR5cGU7XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgSGFsZkZsb2F0VHlwZTpcblxuXHRcdFx0XHRcdFx0bnVtRWxlbWVudHMgPSBpbWFnZV9yZ2JhX2RhdGEubGVuZ3RoIC8gNDtcblx0XHRcdFx0XHRcdGNvbnN0IGhhbGZBcnJheSA9IG5ldyBVaW50MTZBcnJheSggbnVtRWxlbWVudHMgKiA0ICk7XG5cblx0XHRcdFx0XHRcdGZvciAoIGxldCBqID0gMDsgaiA8IG51bUVsZW1lbnRzOyBqICsrICkge1xuXG5cdFx0XHRcdFx0XHRcdFJHQkVCeXRlVG9SR0JIYWxmKCBpbWFnZV9yZ2JhX2RhdGEsIGogKiA0LCBoYWxmQXJyYXksIGogKiA0ICk7XG5cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZGF0YSA9IGhhbGZBcnJheTtcblx0XHRcdFx0XHRcdHR5cGUgPSBIYWxmRmxvYXRUeXBlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRkZWZhdWx0OlxuXG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCAnVEhSRUUuUkdCRUxvYWRlcjogdW5zdXBwb3J0ZWQgdHlwZTogJywgdGhpcy50eXBlICk7XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR3aWR0aDogdywgaGVpZ2h0OiBoLFxuXHRcdFx0XHRcdGRhdGE6IGRhdGEsXG5cdFx0XHRcdFx0aGVhZGVyOiByZ2JlX2hlYWRlcl9pbmZvLnN0cmluZyxcblx0XHRcdFx0XHRnYW1tYTogcmdiZV9oZWFkZXJfaW5mby5nYW1tYSxcblx0XHRcdFx0XHRleHBvc3VyZTogcmdiZV9oZWFkZXJfaW5mby5leHBvc3VyZSxcblx0XHRcdFx0XHR0eXBlOiB0eXBlXG5cdFx0XHRcdH07XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiBudWxsO1xuXG5cdH1cblxuXHRzZXREYXRhVHlwZSggdmFsdWUgKSB7XG5cblx0XHR0aGlzLnR5cGUgPSB2YWx1ZTtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bG9hZCggdXJsLCBvbkxvYWQsIG9uUHJvZ3Jlc3MsIG9uRXJyb3IgKSB7XG5cblx0XHRmdW5jdGlvbiBvbkxvYWRDYWxsYmFjayggdGV4dHVyZSwgdGV4RGF0YSApIHtcblxuXHRcdFx0c3dpdGNoICggdGV4dHVyZS50eXBlICkge1xuXG5cdFx0XHRcdGNhc2UgRmxvYXRUeXBlOlxuXHRcdFx0XHRjYXNlIEhhbGZGbG9hdFR5cGU6XG5cblx0XHRcdFx0XHR0ZXh0dXJlLmNvbG9yU3BhY2UgPSBMaW5lYXJTUkdCQ29sb3JTcGFjZTtcblx0XHRcdFx0XHR0ZXh0dXJlLm1pbkZpbHRlciA9IExpbmVhckZpbHRlcjtcblx0XHRcdFx0XHR0ZXh0dXJlLm1hZ0ZpbHRlciA9IExpbmVhckZpbHRlcjtcblx0XHRcdFx0XHR0ZXh0dXJlLmdlbmVyYXRlTWlwbWFwcyA9IGZhbHNlO1xuXHRcdFx0XHRcdHRleHR1cmUuZmxpcFkgPSB0cnVlO1xuXG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBvbkxvYWQgKSBvbkxvYWQoIHRleHR1cmUsIHRleERhdGEgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiBzdXBlci5sb2FkKCB1cmwsIG9uTG9hZENhbGxiYWNrLCBvblByb2dyZXNzLCBvbkVycm9yICk7XG5cblx0fVxuXG59XG5cbmV4cG9ydCB7IFJHQkVMb2FkZXIgfTtcbiJdLCJuYW1lcyI6WyJNYXRoVXRpbHMuY2xhbXAiLCJNYXRoVXRpbHMuZ2VuZXJhdGVVVUlEIl0sIm1hcHBpbmdzIjoiQUF3RE8sTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBTXRCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQztBQUM1QixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQztBQUNqQyxNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQztBQUNwQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFLM0IsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBRzFCLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDO0FBRXRDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBTTlCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQztBQUN2QixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFLM0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBdUQvQjtBQUNPLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQztBQUNuQztBQUNPLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQztB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RSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFPaGhEO0FBQ0E7QUFDQSxTQUFTLFlBQVksR0FBRztBQUN4QjtBQUNBLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDM0MsQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQztBQUMzQyxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQzNDLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDM0MsQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLEVBQUUsRUFBRSxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxHQUFHLEdBQUc7QUFDbEgsR0FBRyxJQUFJLEVBQUUsRUFBRSxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEdBQUcsR0FBRztBQUNwSCxHQUFHLElBQUksRUFBRSxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLEVBQUU7QUFDOUcsR0FBRyxJQUFJLEVBQUUsRUFBRSxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDO0FBQ2xHO0FBQ0E7QUFDQSxDQUFDLE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNCO0FBQ0EsQ0FBQztB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QyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3ZFLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3ZFO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxNQUFNLEdBQUc7QUFDVjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDcEIsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNwQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRztBQUNWO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckM7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUc7QUFDWjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JDO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxRQUFRLEdBQUc7QUFDWjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNDO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxNQUFNLEdBQUc7QUFDVjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN4RDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsZUFBZSxHQUFHO0FBQ25CO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2pEO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxTQUFTLEdBQUc7QUFDYjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUNqRDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsS0FBSyxHQUFHO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsRUFBRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQzNEO0FBQ0EsRUFBRSxPQUFPLEtBQUssQ0FBQztBQUNmO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHO0FBQ2Q7QUFDQSxFQUFFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO0FBQ2xFO0FBQ0EsRUFBRSxLQUFLLFdBQVcsS0FBSyxDQUFDLEdBQUcsT0FBTyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM5QztBQUNBLEVBQUUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUM7QUFDNUM7QUFDQTtBQUNBO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUVBLEtBQWUsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN2RDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRztBQUNqQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ2xEO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEdBQUc7QUFDeEI7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDM0I7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLG1CQUFtQixFQUFFLENBQUMsR0FBRztBQUMxQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDN0Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsRUFBRSxNQUFNLEdBQUc7QUFDckI7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNuRDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUc7QUFDbEI7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDO0FBQ3JDLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUM7QUFDckM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssR0FBRztBQUM5QjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQztBQUMxQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUM7QUFDMUM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUc7QUFDYjtBQUNBLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRztBQUN0RDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxHQUFHO0FBQ2hDO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUMzQixFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMvQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtB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RyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzNEO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUc7QUFDcEQ7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0I7QUFDQSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUM5QyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUM5QyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUM5QztBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsUUFBUSxHQUFHO0FBQ1o7QUFDQSxFQUFFLElBQUksQ0FBQyxHQUFHO0FBQ1Y7QUFDQSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNWLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ1YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDVjtBQUNBLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FB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RUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzNCO0FBQ0EsRUFBRSxNQUFNLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3BELEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNwRCxFQUFFLE1BQU0sR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDcEQ7QUFDQSxFQUFFLE1BQU0sR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDcEQsRUFBRSxNQUFNLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3BELEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNwRDtBQUNBLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzlDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzlDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzlDO0FBQ0EsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDOUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDOUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDOUM7QUFDQSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUM5QyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUM5QyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUM5QztBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRztBQUNyQjtBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzQjtBQUNBLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNDO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxXQUFXLEdBQUc7QUFDZjtBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzQjtBQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDN0MsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDeEMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN6QztBQUNBLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvRTtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsTUFBTSxHQUFHO0FBQ1Y7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRO0FBQzFCO0FBQ0EsR0FBRyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDOUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDOUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDOUM7QUFDQSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQzlCLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDOUIsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUM5QjtBQUNBLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzNDO0FBQ0EsRUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsT0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEU7QUFDQSxFQUFFLE1BQU0sTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDekI7QUFDQSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO0FBQ3pCLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxLQUFLLE1BQU0sQ0FBQztBQUMvQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsS0FBSyxNQUFNLENBQUM7QUFDL0M7QUFDQSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO0FBQ3pCLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxLQUFLLE1BQU0sQ0FBQztBQUMvQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsS0FBSyxNQUFNLENBQUM7QUFDL0M7QUFDQSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO0FBQ3pCLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxLQUFLLE1BQU0sQ0FBQztBQUMvQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsS0FBSyxNQUFNLENBQUM7QUFDL0M7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsR0FBRztBQUNiO0FBQ0EsRUFBRSxJQUFJLEdBQUcsQ0FBQztBQUNWLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMxQjtBQUNBLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO0FBQzlDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO0FBQzlDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO0FBQzlDO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxlQUFlLEVBQUUsT0FBTyxHQUFHO0FBQzVCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDN0Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLGtCQUFrQixFQUFFLENBQUMsR0FBRztBQUN6QjtBQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMxQjtBQUNBLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNsQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbEIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2xCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNsQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbEIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2xCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNsQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbEIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2xCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxjQUFjLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHO0FBQ3BEO0FBQ0EsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxDQUFDO0FBQ2pDLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUNqQztBQUNBLEVBQUUsSUFBSSxDQUFDLEdBQUc7QUFDVixHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUN2RCxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDM0QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDVixHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHO0FBQ2pCO0FBQ0EsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDOUM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE1BQU0sRUFBRSxLQUFLLEdBQUc7QUFDakI7QUFDQSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7QUFDbEQ7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHO0FBQ3JCO0FBQ0EsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDcEQ7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUN6QjtBQUNBLEVBQUUsS0FBSyxDQUFDLENBQUMsU0FBUyxHQUFHO0FBQ3JCO0FBQ0EsR0FBRyxJQUFJLENBQUMsR0FBRztBQUNYO0FBQ0EsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDWDtBQUNBLElBQUksQ0FBQztBQUNMO0FBQ0EsR0FBRyxNQUFNO0FBQ1Q7QUFDQSxHQUFHLElBQUksQ0FBQyxHQUFHO0FBQ1g7QUFDQSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNYLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ1gsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDWDtBQUNBLElBQUksQ0FBQztBQUNMO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxZQUFZLEVBQUUsS0FBSyxHQUFHO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUM5QixFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDOUI7QUFDQSxFQUFFLElBQUksQ0FBQyxHQUFHO0FBQ1Y7QUFDQSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDVixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNWO0FBQ0EsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ25CO0FBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRztBQUNWO0FBQ0EsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDVixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNWLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ1Y7QUFDQSxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQSxDQUFDLE1BQU0sRUFBRSxNQUFNLEdBQUc7QUFDbEI7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0IsRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQzdCO0FBQ0EsRUFBRSxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHO0FBQ2pDO0FBQ0EsR0FBRyxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsT0FBTyxLQUFLLENBQUM7QUFDM0M7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLENBQUMsR0FBRztBQUNoQztBQUNBLEVBQUUsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRztBQUNqQztBQUNBLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBQzVDO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxPQUFPLEVBQUUsS0FBSyxHQUFHLEVBQUUsRUFBRSxNQUFNLEdBQUcsQ0FBQyxHQUFHO0FBQ25DO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzNCO0FBQ0EsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzVCLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEMsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNoQztBQUNBLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEMsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNoQyxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hDO0FBQ0EsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNoQyxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hDLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEM7QUFDQSxFQUFFLE9BQU8sS0FBSyxDQUFDO0FBQ2Y7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEtBQUssR0FBRztBQUNUO0FBQ0EsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDM0Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDO0FBQ0Q7QUFDQSxNQUFNLEdBQUcsaUJBQWlCLElBQUksT0FBTyxFQUFFOztBQ2pVdkMsU0FBUyxlQUFlLEVBQUUsSUFBSSxHQUFHO0FBQ2pDO0FBQ0EsQ0FBQyxPQUFPLFFBQVEsQ0FBQyxlQUFlLEVBQUUsOEJBQThCLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDekU7QUFDQSxDQUFDO0FBQ0Q7QUFDQSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDbEI7QUFDQSxTQUFTLFFBQVEsRUFBRSxPQUFPLEdBQUc7QUFDN0I7QUFDQSxDQUFDLEtBQUssT0FBTyxJQUFJLE1BQU0sR0FBRyxPQUFPO0FBQ2pDO0FBQ0EsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQzFCO0FBQ0EsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQ3pCO0FBQ0E7O0FDN0VPLFNBQVMsWUFBWSxFQUFFLENBQUMsR0FBRztBQUNsQztBQUNBLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxPQUFPLEtBQUssQ0FBQyxHQUFHLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxZQUFZLEdBQUcsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzlGO0FBQ0E7O0FDSkEsSUFBSSxPQUFPLENBQUM7QUFDWjtBQUNBLE1BQU0sVUFBVSxDQUFDO0FBQ2pCO0FBQ0EsQ0FBQyxPQUFPLFVBQVUsRUFBRSxLQUFLLEdBQUc7QUFDNUI7QUFDQSxFQUFFLEtBQUssU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUc7QUFDckM7QUFDQSxHQUFHLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQztBQUNwQjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsS0FBSyxPQUFPLGlCQUFpQixLQUFLLFdBQVcsR0FBRztBQUNsRDtBQUNBLEdBQUcsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ3BCO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRSxJQUFJLE1BQU0sQ0FBQztBQUNiO0FBQ0EsRUFBRSxLQUFLLEtBQUssWUFBWSxpQkFBaUIsR0FBRztBQUM1QztBQUNBLEdBQUcsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNsQjtBQUNBLEdBQUcsTUFBTTtBQUNUO0FBQ0EsR0FBRyxLQUFLLE9BQU8sS0FBSyxTQUFTLEdBQUcsT0FBTyxHQUFHLGVBQWUsRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUN0RTtBQUNBLEdBQUcsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQy9CLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ2pDO0FBQ0EsR0FBRyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQzlDO0FBQ0EsR0FBRyxLQUFLLEtBQUssWUFBWSxTQUFTLEdBQUc7QUFDckM7QUFDQSxJQUFJLE9BQU8sQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN4QztBQUNBLElBQUksTUFBTTtBQUNWO0FBQ0EsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hFO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsR0FBRyxNQUFNLEdBQUcsT0FBTyxDQUFDO0FBQ3BCO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRSxLQUFLLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHO0FBQ3JEO0FBQ0EsR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLDZFQUE2RSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3hHO0FBQ0EsR0FBRyxPQUFPLE1BQU0sQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ2hEO0FBQ0EsR0FBRyxNQUFNO0FBQ1Q7QUFDQSxHQUFHLE9BQU8sTUFBTSxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsQ0FBQztBQUMxQztBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxZQUFZLEVBQUUsS0FBSyxHQUFHO0FBQzlCO0FBQ0EsRUFBRSxLQUFLLEVBQUUsT0FBTyxnQkFBZ0IsS0FBSyxXQUFXLElBQUksS0FBSyxZQUFZLGdCQUFnQjtBQUNyRixLQUFLLE9BQU8saUJBQWlCLEtBQUssV0FBVyxJQUFJLEtBQUssWUFBWSxpQkFBaUIsRUFBRTtBQUNyRixLQUFLLE9BQU8sV0FBVyxLQUFLLFdBQVcsSUFBSSxLQUFLLFlBQVksV0FBVyxFQUFFLEdBQUc7QUFDNUU7QUFDQSxHQUFHLE1BQU0sTUFBTSxHQUFHLGVBQWUsRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUM5QztBQUNBLEdBQUcsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQzlCLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ2hDO0FBQ0EsR0FBRyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQzdDLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMvRDtBQUNBLEdBQUcsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzdFLEdBQUcsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztBQUMvQjtBQUNBLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUc7QUFDNUM7QUFDQSxJQUFJLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUN0RDtBQUNBLElBQUk7QUFDSjtBQUNBLEdBQUcsT0FBTyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzNDO0FBQ0EsR0FBRyxPQUFPLE1BQU0sQ0FBQztBQUNqQjtBQUNBLEdBQUcsTUFBTSxLQUFLLEtBQUssQ0FBQyxJQUFJLEdBQUc7QUFDM0I7QUFDQSxHQUFHLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3RDO0FBQ0EsR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRztBQUM1QztBQUNBLElBQUksS0FBSyxJQUFJLFlBQVksVUFBVSxJQUFJLElBQUksWUFBWSxpQkFBaUIsR0FBRztBQUMzRTtBQUNBLEtBQUssSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNyRTtBQUNBLEtBQUssTUFBTTtBQUNYO0FBQ0E7QUFDQTtBQUNBLEtBQUssSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUMzQztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUk7QUFDSjtBQUNBLEdBQUcsT0FBTztBQUNWLElBQUksSUFBSSxFQUFFLElBQUk7QUFDZCxJQUFJLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztBQUN0QixJQUFJLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtBQUN4QixJQUFJLENBQUM7QUFDTDtBQUNBLEdBQUcsTUFBTTtBQUNUO0FBQ0EsR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLDZGQUE2RixFQUFFLENBQUM7QUFDakgsR0FBRyxPQUFPLEtBQUssQ0FBQztBQUNoQjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUU7QUFDRjtBQUNBOztBQzNIQSxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDakI7QUFDQSxNQUFNLE1BQU0sQ0FBQztBQUNiO0FBQ0EsQ0FBQyxXQUFXLEVBQUUsSUFBSSxHQUFHLElBQUksR0FBRztBQUM1QjtBQUNBLEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDdkI7QUFDQSxFQUFFLE1BQU0sQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDOUQ7QUFDQSxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUdDLFlBQXNCLEVBQUUsQ0FBQztBQUN2QztBQUNBLEVBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbkI7QUFDQSxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ25CO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxJQUFJLFdBQVcsRUFBRSxLQUFLLEdBQUc7QUFDMUI7QUFDQSxFQUFFLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUM7QUFDeEM7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE1BQU0sRUFBRSxJQUFJLEdBQUc7QUFDaEI7QUFDQSxFQUFFLE1BQU0sWUFBWSxLQUFLLElBQUksS0FBSyxTQUFTLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7QUFDMUU7QUFDQSxFQUFFLEtBQUssRUFBRSxZQUFZLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssU0FBUyxHQUFHO0FBQ2xFO0FBQ0EsR0FBRyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25DO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRSxNQUFNLE1BQU0sR0FBRztBQUNqQixHQUFHLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtBQUNsQixHQUFHLEdBQUcsRUFBRSxFQUFFO0FBQ1YsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDekI7QUFDQSxFQUFFLEtBQUssSUFBSSxLQUFLLElBQUksR0FBRztBQUN2QjtBQUNBLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDWDtBQUNBLEdBQUcsS0FBSyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiO0FBQ0EsSUFBSSxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHO0FBQ3BEO0FBQ0EsS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEdBQUc7QUFDcEM7QUFDQSxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO0FBQ3BEO0FBQ0EsTUFBTSxNQUFNO0FBQ1o7QUFDQSxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDOUM7QUFDQSxNQUFNO0FBQ047QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLE1BQU07QUFDVjtBQUNBO0FBQ0E7QUFDQSxJQUFJLEdBQUcsR0FBRyxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDakM7QUFDQSxJQUFJO0FBQ0o7QUFDQSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ3BCO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRSxLQUFLLEVBQUUsWUFBWSxHQUFHO0FBQ3hCO0FBQ0EsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFDckM7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLE9BQU8sTUFBTSxDQUFDO0FBQ2hCO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQztBQUNEO0FBQ0EsU0FBUyxjQUFjLEVBQUUsS0FBSyxHQUFHO0FBQ2pDO0FBQ0EsQ0FBQyxLQUFLLEVBQUUsT0FBTyxnQkFBZ0IsS0FBSyxXQUFXLElBQUksS0FBSyxZQUFZLGdCQUFnQjtBQUNwRixJQUFJLE9BQU8saUJBQWlCLEtBQUssV0FBVyxJQUFJLEtBQUssWUFBWSxpQkFBaUIsRUFBRTtBQUNwRixJQUFJLE9BQU8sV0FBVyxLQUFLLFdBQVcsSUFBSSxLQUFLLFlBQVksV0FBVyxFQUFFLEdBQUc7QUFDM0U7QUFDQTtBQUNBO0FBQ0EsRUFBRSxPQUFPLFVBQVUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDeEM7QUFDQSxFQUFFLE1BQU07QUFDUjtBQUNBLEVBQUUsS0FBSyxLQUFLLENBQUMsSUFBSSxHQUFHO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLEdBQUcsT0FBTztBQUNWLElBQUksSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRTtBQUNsQyxJQUFJLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztBQUN0QixJQUFJLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtBQUN4QixJQUFJLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJO0FBQ3JDLElBQUksQ0FBQztBQUNMO0FBQ0EsR0FBRyxNQUFNO0FBQ1Q7QUFDQSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsNkNBQTZDLEVBQUUsQ0FBQztBQUNqRSxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBQ2I7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFO0FBQ0Y7QUFDQTs7QUN2R0EsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCO0FBQ0EsTUFBTSxPQUFPLFNBQVMsZUFBZSxDQUFDO0FBQ3RDO0FBQ0EsQ0FBQyxXQUFXLEVBQUUsS0FBSyxHQUFHLE9BQU8sQ0FBQyxhQUFhLEVBQUUsT0FBTyxHQUFHLE9BQU8sQ0FBQyxlQUFlLEVBQUUsS0FBSyxHQUFHLG1CQUFtQixFQUFFLEtBQUssR0FBRyxtQkFBbUIsRUFBRSxTQUFTLEdBQUcsWUFBWSxFQUFFLFNBQVMsR0FBRyx3QkFBd0IsRUFBRSxNQUFNLEdBQUcsVUFBVSxFQUFFLElBQUksR0FBRyxnQkFBZ0IsRUFBRSxVQUFVLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixFQUFFLFVBQVUsR0FBRyxZQUFZLEdBQUc7QUFDN1Q7QUFDQSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ1Y7QUFDQSxFQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3hCO0FBQ0EsRUFBRSxNQUFNLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQy9EO0FBQ0EsRUFBRSxJQUFJLENBQUMsSUFBSSxHQUFHQSxZQUFzQixFQUFFLENBQUM7QUFDdkM7QUFDQSxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2pCO0FBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3BDLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDcEI7QUFDQSxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3pCLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDbkI7QUFDQSxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDckI7QUFDQSxFQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzdCLEVBQUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDN0I7QUFDQSxFQUFFLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQy9CO0FBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUN2QixFQUFFLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzdCLEVBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbkI7QUFDQSxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3BDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDcEMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNwQyxFQUFFLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCO0FBQ0EsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQy9CLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQzlCO0FBQ0EsRUFBRSxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztBQUM5QixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7QUFDaEMsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNwQixFQUFFLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQzNCO0FBQ0EsRUFBRSxLQUFLLE9BQU8sVUFBVSxLQUFLLFFBQVEsR0FBRztBQUN4QztBQUNBLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDaEM7QUFDQSxHQUFHLE1BQU07QUFDVDtBQUNBLEdBQUcsUUFBUSxFQUFFLHFFQUFxRSxFQUFFLENBQUM7QUFDckYsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsS0FBSyxZQUFZLEdBQUcsY0FBYyxHQUFHLFlBQVksQ0FBQztBQUNqRjtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsRUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNyQjtBQUNBLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDbkIsRUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUN2QjtBQUNBLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztBQUNyQyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7QUFDaEM7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLElBQUksS0FBSyxHQUFHO0FBQ2I7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDMUI7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLElBQUksS0FBSyxFQUFFLEtBQUssR0FBRyxJQUFJLEdBQUc7QUFDM0I7QUFDQSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztBQUMzQjtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsWUFBWSxHQUFHO0FBQ2hCO0FBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDeEk7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEtBQUssR0FBRztBQUNUO0FBQ0EsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM3QztBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxFQUFFLE1BQU0sR0FBRztBQUNoQjtBQUNBLEVBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQzFCO0FBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDOUIsRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzNDO0FBQ0EsRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDaEMsRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDaEM7QUFDQSxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUM1QixFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUM1QjtBQUNBLEVBQUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ3BDLEVBQUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ3BDO0FBQ0EsRUFBRSxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDdEM7QUFDQSxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUM5QixFQUFFLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUM5QyxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUMxQjtBQUNBLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3BDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE1B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QUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsQ0FBQyxNQUFNLFVBQVUsR0FBRyxJQUFJLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMzQztBQUNBLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRztBQUNsQztBQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNwQjtBQUNBO0FBQ0E7QUFDQSxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHO0FBQ2xCO0FBQ0EsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDO0FBQzNCLEdBQUcsU0FBUyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFDbkMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLEdBQUcsVUFBVSxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDaEM7QUFDQTtBQUNBO0FBQ0EsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHO0FBQ3pCO0FBQ0EsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEdBQUcsTUFBTSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQzNDLEdBQUcsU0FBUyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsS0FBSyxNQUFNLENBQUM7QUFDaEUsR0FBRyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLEdBQUcsVUFBVSxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckM7QUFDQTtBQUNBO0FBQ0EsR0FBRyxNQUFNLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FB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
