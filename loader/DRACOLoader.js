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

// compute euclidean modulo of m % n
// https://en.wikipedia.org/wiki/Modulo_operation
function euclideanModulo( n, m ) {

	return ( ( n % m ) + m ) % m;

}

// https://en.wikipedia.org/wiki/Linear_interpolation
function lerp( x, y, t ) {

	return ( 1 - t ) * x + t * y;

}

function denormalize( value, array ) {

	switch ( array.constructor ) {

		case Float32Array:

			return value;

		case Uint32Array:

			return value / 4294967295.0;

		case Uint16Array:

			return value / 65535.0;

		case Uint8Array:

			return value / 255.0;

		case Int32Array:

			return Math.max( value / 2147483647.0, - 1.0 );

		case Int16Array:

			return Math.max( value / 32767.0, - 1.0 );

		case Int8Array:

			return Math.max( value / 127.0, - 1.0 );

		default:

			throw new Error( 'Invalid component type.' );

	}

}

function normalize( value, array ) {

	switch ( array.constructor ) {

		case Float32Array:

			return value;

		case Uint32Array:

			return Math.round( value * 4294967295.0 );

		case Uint16Array:

			return Math.round( value * 65535.0 );

		case Uint8Array:

			return Math.round( value * 255.0 );

		case Int32Array:

			return Math.round( value * 2147483647.0 );

		case Int16Array:

			return Math.round( value * 32767.0 );

		case Int8Array:

			return Math.round( value * 127.0 );

		default:

			throw new Error( 'Invalid component type.' );

	}

}

class Quaternion {

	constructor( x = 0, y = 0, z = 0, w = 1 ) {

		this.isQuaternion = true;

		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

	}

	static slerpFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t ) {

		// fuzz-free, array-based Quaternion SLERP operation

		let x0 = src0[ srcOffset0 + 0 ],
			y0 = src0[ srcOffset0 + 1 ],
			z0 = src0[ srcOffset0 + 2 ],
			w0 = src0[ srcOffset0 + 3 ];

		const x1 = src1[ srcOffset1 + 0 ],
			y1 = src1[ srcOffset1 + 1 ],
			z1 = src1[ srcOffset1 + 2 ],
			w1 = src1[ srcOffset1 + 3 ];

		if ( t === 0 ) {

			dst[ dstOffset + 0 ] = x0;
			dst[ dstOffset + 1 ] = y0;
			dst[ dstOffset + 2 ] = z0;
			dst[ dstOffset + 3 ] = w0;
			return;

		}

		if ( t === 1 ) {

			dst[ dstOffset + 0 ] = x1;
			dst[ dstOffset + 1 ] = y1;
			dst[ dstOffset + 2 ] = z1;
			dst[ dstOffset + 3 ] = w1;
			return;

		}

		if ( w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1 ) {

			let s = 1 - t;
			const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
				dir = ( cos >= 0 ? 1 : - 1 ),
				sqrSin = 1 - cos * cos;

			// Skip the Slerp for tiny steps to avoid numeric problems:
			if ( sqrSin > Number.EPSILON ) {

				const sin = Math.sqrt( sqrSin ),
					len = Math.atan2( sin, cos * dir );

				s = Math.sin( s * len ) / sin;
				t = Math.sin( t * len ) / sin;

			}

			const tDir = t * dir;

			x0 = x0 * s + x1 * tDir;
			y0 = y0 * s + y1 * tDir;
			z0 = z0 * s + z1 * tDir;
			w0 = w0 * s + w1 * tDir;

			// Normalize in case we just did a lerp:
			if ( s === 1 - t ) {

				const f = 1 / Math.sqrt( x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0 );

				x0 *= f;
				y0 *= f;
				z0 *= f;
				w0 *= f;

			}

		}

		dst[ dstOffset ] = x0;
		dst[ dstOffset + 1 ] = y0;
		dst[ dstOffset + 2 ] = z0;
		dst[ dstOffset + 3 ] = w0;

	}

	static multiplyQuaternionsFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1 ) {

		const x0 = src0[ srcOffset0 ];
		const y0 = src0[ srcOffset0 + 1 ];
		const z0 = src0[ srcOffset0 + 2 ];
		const w0 = src0[ srcOffset0 + 3 ];

		const x1 = src1[ srcOffset1 ];
		const y1 = src1[ srcOffset1 + 1 ];
		const z1 = src1[ srcOffset1 + 2 ];
		const w1 = src1[ srcOffset1 + 3 ];

		dst[ dstOffset ] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
		dst[ dstOffset + 1 ] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
		dst[ dstOffset + 2 ] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
		dst[ dstOffset + 3 ] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;

		return dst;

	}

	get x() {

		return this._x;

	}

	set x( value ) {

		this._x = value;
		this._onChangeCallback();

	}

	get y() {

		return this._y;

	}

	set y( value ) {

		this._y = value;
		this._onChangeCallback();

	}

	get z() {

		return this._z;

	}

	set z( value ) {

		this._z = value;
		this._onChangeCallback();

	}

	get w() {

		return this._w;

	}

	set w( value ) {

		this._w = value;
		this._onChangeCallback();

	}

	set( x, y, z, w ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

		this._onChangeCallback();

		return this;

	}

	clone() {

		return new this.constructor( this._x, this._y, this._z, this._w );

	}

	copy( quaternion ) {

		this._x = quaternion.x;
		this._y = quaternion.y;
		this._z = quaternion.z;
		this._w = quaternion.w;

		this._onChangeCallback();

		return this;

	}

	setFromEuler( euler, update ) {

		const x = euler._x, y = euler._y, z = euler._z, order = euler._order;

		// http://www.mathworks.com/matlabcentral/fileexchange/
		// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
		//	content/SpinCalc.m

		const cos = Math.cos;
		const sin = Math.sin;

		const c1 = cos( x / 2 );
		const c2 = cos( y / 2 );
		const c3 = cos( z / 2 );

		const s1 = sin( x / 2 );
		const s2 = sin( y / 2 );
		const s3 = sin( z / 2 );

		switch ( order ) {

			case 'XYZ':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case 'YXZ':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			case 'ZXY':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case 'ZYX':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			case 'YZX':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case 'XZY':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			default:
				console.warn( 'THREE.Quaternion: .setFromEuler() encountered an unknown order: ' + order );

		}

		if ( update !== false ) this._onChangeCallback();

		return this;

	}

	setFromAxisAngle( axis, angle ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

		// assumes axis is normalized

		const halfAngle = angle / 2, s = Math.sin( halfAngle );

		this._x = axis.x * s;
		this._y = axis.y * s;
		this._z = axis.z * s;
		this._w = Math.cos( halfAngle );

		this._onChangeCallback();

		return this;

	}

	setFromRotationMatrix( m ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		const te = m.elements,

			m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
			m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
			m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],

			trace = m11 + m22 + m33;

		if ( trace > 0 ) {

			const s = 0.5 / Math.sqrt( trace + 1.0 );

			this._w = 0.25 / s;
			this._x = ( m32 - m23 ) * s;
			this._y = ( m13 - m31 ) * s;
			this._z = ( m21 - m12 ) * s;

		} else if ( m11 > m22 && m11 > m33 ) {

			const s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

			this._w = ( m32 - m23 ) / s;
			this._x = 0.25 * s;
			this._y = ( m12 + m21 ) / s;
			this._z = ( m13 + m31 ) / s;

		} else if ( m22 > m33 ) {

			const s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

			this._w = ( m13 - m31 ) / s;
			this._x = ( m12 + m21 ) / s;
			this._y = 0.25 * s;
			this._z = ( m23 + m32 ) / s;

		} else {

			const s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

			this._w = ( m21 - m12 ) / s;
			this._x = ( m13 + m31 ) / s;
			this._y = ( m23 + m32 ) / s;
			this._z = 0.25 * s;

		}

		this._onChangeCallback();

		return this;

	}

	setFromUnitVectors( vFrom, vTo ) {

		// assumes direction vectors vFrom and vTo are normalized

		let r = vFrom.dot( vTo ) + 1;

		if ( r < Number.EPSILON ) {

			// vFrom and vTo point in opposite directions

			r = 0;

			if ( Math.abs( vFrom.x ) > Math.abs( vFrom.z ) ) {

				this._x = - vFrom.y;
				this._y = vFrom.x;
				this._z = 0;
				this._w = r;

			} else {

				this._x = 0;
				this._y = - vFrom.z;
				this._z = vFrom.y;
				this._w = r;

			}

		} else {

			// crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3

			this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
			this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
			this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
			this._w = r;

		}

		return this.normalize();

	}

	angleTo( q ) {

		return 2 * Math.acos( Math.abs( clamp( this.dot( q ), - 1, 1 ) ) );

	}

	rotateTowards( q, step ) {

		const angle = this.angleTo( q );

		if ( angle === 0 ) return this;

		const t = Math.min( 1, step / angle );

		this.slerp( q, t );

		return this;

	}

	identity() {

		return this.set( 0, 0, 0, 1 );

	}

	invert() {

		// quaternion is assumed to have unit length

		return this.conjugate();

	}

	conjugate() {

		this._x *= - 1;
		this._y *= - 1;
		this._z *= - 1;

		this._onChangeCallback();

		return this;

	}

	dot( v ) {

		return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;

	}

	lengthSq() {

		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;

	}

	length() {

		return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w );

	}

	normalize() {

		let l = this.length();

		if ( l === 0 ) {

			this._x = 0;
			this._y = 0;
			this._z = 0;
			this._w = 1;

		} else {

			l = 1 / l;

			this._x = this._x * l;
			this._y = this._y * l;
			this._z = this._z * l;
			this._w = this._w * l;

		}

		this._onChangeCallback();

		return this;

	}

	multiply( q ) {

		return this.multiplyQuaternions( this, q );

	}

	premultiply( q ) {

		return this.multiplyQuaternions( q, this );

	}

	multiplyQuaternions( a, b ) {

		// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

		const qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
		const qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

		this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		this._onChangeCallback();

		return this;

	}

	slerp( qb, t ) {

		if ( t === 0 ) return this;
		if ( t === 1 ) return this.copy( qb );

		const x = this._x, y = this._y, z = this._z, w = this._w;

		// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

		let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

		if ( cosHalfTheta < 0 ) {

			this._w = - qb._w;
			this._x = - qb._x;
			this._y = - qb._y;
			this._z = - qb._z;

			cosHalfTheta = - cosHalfTheta;

		} else {

			this.copy( qb );

		}

		if ( cosHalfTheta >= 1.0 ) {

			this._w = w;
			this._x = x;
			this._y = y;
			this._z = z;

			return this;

		}

		const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

		if ( sqrSinHalfTheta <= Number.EPSILON ) {

			const s = 1 - t;
			this._w = s * w + t * this._w;
			this._x = s * x + t * this._x;
			this._y = s * y + t * this._y;
			this._z = s * z + t * this._z;

			this.normalize();
			this._onChangeCallback();

			return this;

		}

		const sinHalfTheta = Math.sqrt( sqrSinHalfTheta );
		const halfTheta = Math.atan2( sinHalfTheta, cosHalfTheta );
		const ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
			ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

		this._w = ( w * ratioA + this._w * ratioB );
		this._x = ( x * ratioA + this._x * ratioB );
		this._y = ( y * ratioA + this._y * ratioB );
		this._z = ( z * ratioA + this._z * ratioB );

		this._onChangeCallback();

		return this;

	}

	slerpQuaternions( qa, qb, t ) {

		return this.copy( qa ).slerp( qb, t );

	}

	random() {

		// Derived from http://planning.cs.uiuc.edu/node198.html
		// Note, this source uses w, x, y, z ordering,
		// so we swap the order below.

		const u1 = Math.random();
		const sqrt1u1 = Math.sqrt( 1 - u1 );
		const sqrtu1 = Math.sqrt( u1 );

		const u2 = 2 * Math.PI * Math.random();

		const u3 = 2 * Math.PI * Math.random();

		return this.set(
			sqrt1u1 * Math.cos( u2 ),
			sqrtu1 * Math.sin( u3 ),
			sqrtu1 * Math.cos( u3 ),
			sqrt1u1 * Math.sin( u2 ),
		);

	}

	equals( quaternion ) {

		return ( quaternion._x === this._x ) && ( quaternion._y === this._y ) && ( quaternion._z === this._z ) && ( quaternion._w === this._w );

	}

	fromArray( array, offset = 0 ) {

		this._x = array[ offset ];
		this._y = array[ offset + 1 ];
		this._z = array[ offset + 2 ];
		this._w = array[ offset + 3 ];

		this._onChangeCallback();

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._w;

		return array;

	}

	fromBufferAttribute( attribute, index ) {

		this._x = attribute.getX( index );
		this._y = attribute.getY( index );
		this._z = attribute.getZ( index );
		this._w = attribute.getW( index );

		return this;

	}

	toJSON() {

		return this.toArray();

	}

	_onChange( callback ) {

		this._onChangeCallback = callback;

		return this;

	}

	_onChangeCallback() {}

	*[ Symbol.iterator ]() {

		yield this._x;
		yield this._y;
		yield this._z;
		yield this._w;

	}

}

class Vector3 {

	constructor( x = 0, y = 0, z = 0 ) {

		Vector3.prototype.isVector3 = true;

		this.x = x;
		this.y = y;
		this.z = z;

	}

	set( x, y, z ) {

		if ( z === undefined ) z = this.z; // sprite.scale.set(x,y)

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	}

	setScalar( scalar ) {

		this.x = scalar;
		this.y = scalar;
		this.z = scalar;

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

	setZ( z ) {

		this.z = z;

		return this;

	}

	setComponent( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

		return this;

	}

	getComponent( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error( 'index is out of range: ' + index );

		}

	}

	clone() {

		return new this.constructor( this.x, this.y, this.z );

	}

	copy( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	}

	add( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	}

	addScalar( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	}

	addVectors( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	}

	addScaledVector( v, s ) {

		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;

		return this;

	}

	sub( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	subScalar( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	}

	subVectors( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	}

	multiply( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	}

	multiplyScalar( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	}

	multiplyVectors( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	}

	applyEuler( euler ) {

		return this.applyQuaternion( _quaternion$2.setFromEuler( euler ) );

	}

	applyAxisAngle( axis, angle ) {

		return this.applyQuaternion( _quaternion$2.setFromAxisAngle( axis, angle ) );

	}

	applyMatrix3( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

		return this;

	}

	applyNormalMatrix( m ) {

		return this.applyMatrix3( m ).normalize();

	}

	applyMatrix4( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
		this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
		this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

		return this;

	}

	applyQuaternion( q ) {

		const x = this.x, y = this.y, z = this.z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// calculate quat * vector

		const ix = qw * x + qy * z - qz * y;
		const iy = qw * y + qz * x - qx * z;
		const iz = qw * z + qx * y - qy * x;
		const iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	}

	project( camera ) {

		return this.applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );

	}

	unproject( camera ) {

		return this.applyMatrix4( camera.projectionMatrixInverse ).applyMatrix4( camera.matrixWorld );

	}

	transformDirection( m ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		return this.normalize();

	}

	divide( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	}

	divideScalar( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	min( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );
		this.z = Math.min( this.z, v.z );

		return this;

	}

	max( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );
		this.z = Math.max( this.z, v.z );

		return this;

	}

	clamp( min, max ) {

		// assumes min < max, componentwise

		this.x = Math.max( min.x, Math.min( max.x, this.x ) );
		this.y = Math.max( min.y, Math.min( max.y, this.y ) );
		this.z = Math.max( min.z, Math.min( max.z, this.z ) );

		return this;

	}

	clampScalar( minVal, maxVal ) {

		this.x = Math.max( minVal, Math.min( maxVal, this.x ) );
		this.y = Math.max( minVal, Math.min( maxVal, this.y ) );
		this.z = Math.max( minVal, Math.min( maxVal, this.z ) );

		return this;

	}

	clampLength( min, max ) {

		const length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar( Math.max( min, Math.min( max, length ) ) );

	}

	floor() {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );

		return this;

	}

	ceil() {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );

		return this;

	}

	round() {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );

		return this;

	}

	roundToZero() {

		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
		this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

		return this;

	}

	negate() {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

		return this;

	}

	dot( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	}

	// TODO lengthSquared?

	lengthSq() {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	}

	length() {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	}

	manhattanLength() {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	}

	normalize() {

		return this.divideScalar( this.length() || 1 );

	}

	setLength( length ) {

		return this.normalize().multiplyScalar( length );

	}

	lerp( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;

		return this;

	}

	lerpVectors( v1, v2, alpha ) {

		this.x = v1.x + ( v2.x - v1.x ) * alpha;
		this.y = v1.y + ( v2.y - v1.y ) * alpha;
		this.z = v1.z + ( v2.z - v1.z ) * alpha;

		return this;

	}

	cross( v ) {

		return this.crossVectors( this, v );

	}

	crossVectors( a, b ) {

		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;

	}

	projectOnVector( v ) {

		const denominator = v.lengthSq();

		if ( denominator === 0 ) return this.set( 0, 0, 0 );

		const scalar = v.dot( this ) / denominator;

		return this.copy( v ).multiplyScalar( scalar );

	}

	projectOnPlane( planeNormal ) {

		_vector$3.copy( this ).projectOnVector( planeNormal );

		return this.sub( _vector$3 );

	}

	reflect( normal ) {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		return this.sub( _vector$3.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

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

		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return dx * dx + dy * dy + dz * dz;

	}

	manhattanDistanceTo( v ) {

		return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y ) + Math.abs( this.z - v.z );

	}

	setFromSpherical( s ) {

		return this.setFromSphericalCoords( s.radius, s.phi, s.theta );

	}

	setFromSphericalCoords( radius, phi, theta ) {

		const sinPhiRadius = Math.sin( phi ) * radius;

		this.x = sinPhiRadius * Math.sin( theta );
		this.y = Math.cos( phi ) * radius;
		this.z = sinPhiRadius * Math.cos( theta );

		return this;

	}

	setFromCylindrical( c ) {

		return this.setFromCylindricalCoords( c.radius, c.theta, c.y );

	}

	setFromCylindricalCoords( radius, theta, y ) {

		this.x = radius * Math.sin( theta );
		this.y = y;
		this.z = radius * Math.cos( theta );

		return this;

	}

	setFromMatrixPosition( m ) {

		const e = m.elements;

		this.x = e[ 12 ];
		this.y = e[ 13 ];
		this.z = e[ 14 ];

		return this;

	}

	setFromMatrixScale( m ) {

		const sx = this.setFromMatrixColumn( m, 0 ).length();
		const sy = this.setFromMatrixColumn( m, 1 ).length();
		const sz = this.setFromMatrixColumn( m, 2 ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;

	}

	setFromMatrixColumn( m, index ) {

		return this.fromArray( m.elements, index * 4 );

	}

	setFromMatrix3Column( m, index ) {

		return this.fromArray( m.elements, index * 3 );

	}

	setFromEuler( e ) {

		this.x = e._x;
		this.y = e._y;
		this.z = e._z;

		return this;

	}

	setFromColor( c ) {

		this.x = c.r;
		this.y = c.g;
		this.z = c.b;

		return this;

	}

	equals( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	}

	fromArray( array, offset = 0 ) {

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;

	}

	fromBufferAttribute( attribute, index ) {

		this.x = attribute.getX( index );
		this.y = attribute.getY( index );
		this.z = attribute.getZ( index );

		return this;

	}

	random() {

		this.x = Math.random();
		this.y = Math.random();
		this.z = Math.random();

		return this;

	}

	randomDirection() {

		// Derived from https://mathworld.wolfram.com/SpherePointPicking.html

		const u = ( Math.random() - 0.5 ) * 2;
		const t = Math.random() * Math.PI * 2;
		const f = Math.sqrt( 1 - u ** 2 );

		this.x = f * Math.cos( t );
		this.y = f * Math.sin( t );
		this.z = u;

		return this;

	}

	*[ Symbol.iterator ]() {

		yield this.x;
		yield this.y;
		yield this.z;

	}

}

const _vector$3 = /*@__PURE__*/ new Vector3();
const _quaternion$2 = /*@__PURE__*/ new Quaternion();

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

const FloatType = 1015;
const SRGBColorSpace = 'srgb';
const LinearSRGBColorSpace = 'srgb-linear';
const DisplayP3ColorSpace = 'display-p3';

const StaticDrawUsage = 35044;

const WebGLCoordinateSystem = 2000;
const WebGPUCoordinateSystem = 2001;

const _vector$2 = /*@__PURE__*/ new Vector3();
const _vector2 = /*@__PURE__*/ new Vector2();

class BufferAttribute {

	constructor( array, itemSize, normalized = false ) {

		if ( Array.isArray( array ) ) {

			throw new TypeError( 'THREE.BufferAttribute: array should be a Typed Array.' );

		}

		this.isBufferAttribute = true;

		this.name = '';

		this.array = array;
		this.itemSize = itemSize;
		this.count = array !== undefined ? array.length / itemSize : 0;
		this.normalized = normalized;

		this.usage = StaticDrawUsage;
		this.updateRange = { offset: 0, count: - 1 };
		this.gpuType = FloatType;

		this.version = 0;

	}

	onUploadCallback() {}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	setUsage( value ) {

		this.usage = value;

		return this;

	}

	copy( source ) {

		this.name = source.name;
		this.array = new source.array.constructor( source.array );
		this.itemSize = source.itemSize;
		this.count = source.count;
		this.normalized = source.normalized;

		this.usage = source.usage;
		this.gpuType = source.gpuType;

		return this;

	}

	copyAt( index1, attribute, index2 ) {

		index1 *= this.itemSize;
		index2 *= attribute.itemSize;

		for ( let i = 0, l = this.itemSize; i < l; i ++ ) {

			this.array[ index1 + i ] = attribute.array[ index2 + i ];

		}

		return this;

	}

	copyArray( array ) {

		this.array.set( array );

		return this;

	}

	applyMatrix3( m ) {

		if ( this.itemSize === 2 ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_vector2.fromBufferAttribute( this, i );
				_vector2.applyMatrix3( m );

				this.setXY( i, _vector2.x, _vector2.y );

			}

		} else if ( this.itemSize === 3 ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_vector$2.fromBufferAttribute( this, i );
				_vector$2.applyMatrix3( m );

				this.setXYZ( i, _vector$2.x, _vector$2.y, _vector$2.z );

			}

		}

		return this;

	}

	applyMatrix4( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_vector$2.fromBufferAttribute( this, i );

			_vector$2.applyMatrix4( m );

			this.setXYZ( i, _vector$2.x, _vector$2.y, _vector$2.z );

		}

		return this;

	}

	applyNormalMatrix( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_vector$2.fromBufferAttribute( this, i );

			_vector$2.applyNormalMatrix( m );

			this.setXYZ( i, _vector$2.x, _vector$2.y, _vector$2.z );

		}

		return this;

	}

	transformDirection( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_vector$2.fromBufferAttribute( this, i );

			_vector$2.transformDirection( m );

			this.setXYZ( i, _vector$2.x, _vector$2.y, _vector$2.z );

		}

		return this;

	}

	set( value, offset = 0 ) {

		// Matching BufferAttribute constructor, do not normalize the array.
		this.array.set( value, offset );

		return this;

	}

	getX( index ) {

		let x = this.array[ index * this.itemSize ];

		if ( this.normalized ) x = denormalize( x, this.array );

		return x;

	}

	setX( index, x ) {

		if ( this.normalized ) x = normalize( x, this.array );

		this.array[ index * this.itemSize ] = x;

		return this;

	}

	getY( index ) {

		let y = this.array[ index * this.itemSize + 1 ];

		if ( this.normalized ) y = denormalize( y, this.array );

		return y;

	}

	setY( index, y ) {

		if ( this.normalized ) y = normalize( y, this.array );

		this.array[ index * this.itemSize + 1 ] = y;

		return this;

	}

	getZ( index ) {

		let z = this.array[ index * this.itemSize + 2 ];

		if ( this.normalized ) z = denormalize( z, this.array );

		return z;

	}

	setZ( index, z ) {

		if ( this.normalized ) z = normalize( z, this.array );

		this.array[ index * this.itemSize + 2 ] = z;

		return this;

	}

	getW( index ) {

		let w = this.array[ index * this.itemSize + 3 ];

		if ( this.normalized ) w = denormalize( w, this.array );

		return w;

	}

	setW( index, w ) {

		if ( this.normalized ) w = normalize( w, this.array );

		this.array[ index * this.itemSize + 3 ] = w;

		return this;

	}

	setXY( index, x, y ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );

		}

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;

		return this;

	}

	setXYZ( index, x, y, z ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );

		}

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;

		return this;

	}

	setXYZW( index, x, y, z, w ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );
			w = normalize( w, this.array );

		}

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;
		this.array[ index + 3 ] = w;

		return this;

	}

	onUpload( callback ) {

		this.onUploadCallback = callback;

		return this;

	}

	clone() {

		return new this.constructor( this.array, this.itemSize ).copy( this );

	}

	toJSON() {

		const data = {
			itemSize: this.itemSize,
			type: this.array.constructor.name,
			array: Array.from( this.array ),
			normalized: this.normalized
		};

		if ( this.name !== '' ) data.name = this.name;
		if ( this.usage !== StaticDrawUsage ) data.usage = this.usage;
		if ( this.updateRange.offset !== 0 || this.updateRange.count !== - 1 ) data.updateRange = this.updateRange;

		return data;

	}

}

class Uint16BufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized ) {

		super( new Uint16Array( array ), itemSize, normalized );

	}

}

class Uint32BufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized ) {

		super( new Uint32Array( array ), itemSize, normalized );

	}

}


class Float32BufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized ) {

		super( new Float32Array( array ), itemSize, normalized );

	}

}

class Box3 {

	constructor( min = new Vector3( + Infinity, + Infinity, + Infinity ), max = new Vector3( - Infinity, - Infinity, - Infinity ) ) {

		this.isBox3 = true;

		this.min = min;
		this.max = max;

	}

	set( min, max ) {

		this.min.copy( min );
		this.max.copy( max );

		return this;

	}

	setFromArray( array ) {

		this.makeEmpty();

		for ( let i = 0, il = array.length; i < il; i += 3 ) {

			this.expandByPoint( _vector$1.fromArray( array, i ) );

		}

		return this;

	}

	setFromBufferAttribute( attribute ) {

		this.makeEmpty();

		for ( let i = 0, il = attribute.count; i < il; i ++ ) {

			this.expandByPoint( _vector$1.fromBufferAttribute( attribute, i ) );

		}

		return this;

	}

	setFromPoints( points ) {

		this.makeEmpty();

		for ( let i = 0, il = points.length; i < il; i ++ ) {

			this.expandByPoint( points[ i ] );

		}

		return this;

	}

	setFromCenterAndSize( center, size ) {

		const halfSize = _vector$1.copy( size ).multiplyScalar( 0.5 );

		this.min.copy( center ).sub( halfSize );
		this.max.copy( center ).add( halfSize );

		return this;

	}

	setFromObject( object, precise = false ) {

		this.makeEmpty();

		return this.expandByObject( object, precise );

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( box ) {

		this.min.copy( box.min );
		this.max.copy( box.max );

		return this;

	}

	makeEmpty() {

		this.min.x = this.min.y = this.min.z = + Infinity;
		this.max.x = this.max.y = this.max.z = - Infinity;

		return this;

	}

	isEmpty() {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

		return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y ) || ( this.max.z < this.min.z );

	}

	getCenter( target ) {

		return this.isEmpty() ? target.set( 0, 0, 0 ) : target.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

	}

	getSize( target ) {

		return this.isEmpty() ? target.set( 0, 0, 0 ) : target.subVectors( this.max, this.min );

	}

	expandByPoint( point ) {

		this.min.min( point );
		this.max.max( point );

		return this;

	}

	expandByVector( vector ) {

		this.min.sub( vector );
		this.max.add( vector );

		return this;

	}

	expandByScalar( scalar ) {

		this.min.addScalar( - scalar );
		this.max.addScalar( scalar );

		return this;

	}

	expandByObject( object, precise = false ) {

		// Computes the world-axis-aligned bounding box of an object (including its children),
		// accounting for both the object's, and children's, world transforms

		object.updateWorldMatrix( false, false );

		if ( object.boundingBox !== undefined ) {

			if ( object.boundingBox === null ) {

				object.computeBoundingBox();

			}

			_box$2.copy( object.boundingBox );
			_box$2.applyMatrix4( object.matrixWorld );

			this.union( _box$2 );

		} else {

			const geometry = object.geometry;

			if ( geometry !== undefined ) {

				if ( precise && geometry.attributes !== undefined && geometry.attributes.position !== undefined ) {

					const position = geometry.attributes.position;
					for ( let i = 0, l = position.count; i < l; i ++ ) {

						_vector$1.fromBufferAttribute( position, i ).applyMatrix4( object.matrixWorld );
						this.expandByPoint( _vector$1 );

					}

				} else {

					if ( geometry.boundingBox === null ) {

						geometry.computeBoundingBox();

					}

					_box$2.copy( geometry.boundingBox );
					_box$2.applyMatrix4( object.matrixWorld );

					this.union( _box$2 );

				}

			}

		}

		const children = object.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			this.expandByObject( children[ i ], precise );

		}

		return this;

	}

	containsPoint( point ) {

		return point.x < this.min.x || point.x > this.max.x ||
			point.y < this.min.y || point.y > this.max.y ||
			point.z < this.min.z || point.z > this.max.z ? false : true;

	}

	containsBox( box ) {

		return this.min.x <= box.min.x && box.max.x <= this.max.x &&
			this.min.y <= box.min.y && box.max.y <= this.max.y &&
			this.min.z <= box.min.z && box.max.z <= this.max.z;

	}

	getParameter( point, target ) {

		// This can potentially have a divide by zero if the box
		// has a size dimension of 0.

		return target.set(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y ),
			( point.z - this.min.z ) / ( this.max.z - this.min.z )
		);

	}

	intersectsBox( box ) {

		// using 6 splitting planes to rule out intersections.
		return box.max.x < this.min.x || box.min.x > this.max.x ||
			box.max.y < this.min.y || box.min.y > this.max.y ||
			box.max.z < this.min.z || box.min.z > this.max.z ? false : true;

	}

	intersectsSphere( sphere ) {

		// Find the point on the AABB closest to the sphere center.
		this.clampPoint( sphere.center, _vector$1 );

		// If that point is inside the sphere, the AABB and sphere intersect.
		return _vector$1.distanceToSquared( sphere.center ) <= ( sphere.radius * sphere.radius );

	}

	intersectsPlane( plane ) {

		// We compute the minimum and maximum dot product values. If those values
		// are on the same side (back or front) of the plane, then there is no intersection.

		let min, max;

		if ( plane.normal.x > 0 ) {

			min = plane.normal.x * this.min.x;
			max = plane.normal.x * this.max.x;

		} else {

			min = plane.normal.x * this.max.x;
			max = plane.normal.x * this.min.x;

		}

		if ( plane.normal.y > 0 ) {

			min += plane.normal.y * this.min.y;
			max += plane.normal.y * this.max.y;

		} else {

			min += plane.normal.y * this.max.y;
			max += plane.normal.y * this.min.y;

		}

		if ( plane.normal.z > 0 ) {

			min += plane.normal.z * this.min.z;
			max += plane.normal.z * this.max.z;

		} else {

			min += plane.normal.z * this.max.z;
			max += plane.normal.z * this.min.z;

		}

		return ( min <= - plane.constant && max >= - plane.constant );

	}

	intersectsTriangle( triangle ) {

		if ( this.isEmpty() ) {

			return false;

		}

		// compute box center and extents
		this.getCenter( _center );
		_extents.subVectors( this.max, _center );

		// translate triangle to aabb origin
		_v0.subVectors( triangle.a, _center );
		_v1$3.subVectors( triangle.b, _center );
		_v2$1.subVectors( triangle.c, _center );

		// compute edge vectors for triangle
		_f0.subVectors( _v1$3, _v0 );
		_f1.subVectors( _v2$1, _v1$3 );
		_f2.subVectors( _v0, _v2$1 );

		// test against axes that are given by cross product combinations of the edges of the triangle and the edges of the aabb
		// make an axis testing of each of the 3 sides of the aabb against each of the 3 sides of the triangle = 9 axis of separation
		// axis_ij = u_i x f_j (u0, u1, u2 = face normals of aabb = x,y,z axes vectors since aabb is axis aligned)
		let axes = [
			0, - _f0.z, _f0.y, 0, - _f1.z, _f1.y, 0, - _f2.z, _f2.y,
			_f0.z, 0, - _f0.x, _f1.z, 0, - _f1.x, _f2.z, 0, - _f2.x,
			- _f0.y, _f0.x, 0, - _f1.y, _f1.x, 0, - _f2.y, _f2.x, 0
		];
		if ( ! satForAxes( axes, _v0, _v1$3, _v2$1, _extents ) ) {

			return false;

		}

		// test 3 face normals from the aabb
		axes = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
		if ( ! satForAxes( axes, _v0, _v1$3, _v2$1, _extents ) ) {

			return false;

		}

		// finally testing the face normal of the triangle
		// use already existing triangle edge vectors here
		_triangleNormal.crossVectors( _f0, _f1 );
		axes = [ _triangleNormal.x, _triangleNormal.y, _triangleNormal.z ];

		return satForAxes( axes, _v0, _v1$3, _v2$1, _extents );

	}

	clampPoint( point, target ) {

		return target.copy( point ).clamp( this.min, this.max );

	}

	distanceToPoint( point ) {

		return this.clampPoint( point, _vector$1 ).distanceTo( point );

	}

	getBoundingSphere( target ) {

		if ( this.isEmpty() ) {

			target.makeEmpty();

		} else {

			this.getCenter( target.center );

			target.radius = this.getSize( _vector$1 ).length() * 0.5;

		}

		return target;

	}

	intersect( box ) {

		this.min.max( box.min );
		this.max.min( box.max );

		// ensure that if there is no overlap, the result is fully empty, not slightly empty with non-inf/+inf values that will cause subsequence intersects to erroneously return valid values.
		if ( this.isEmpty() ) this.makeEmpty();

		return this;

	}

	union( box ) {

		this.min.min( box.min );
		this.max.max( box.max );

		return this;

	}

	applyMatrix4( matrix ) {

		// transform of empty box is an empty box.
		if ( this.isEmpty() ) return this;

		// NOTE: I am using a binary pattern to specify all 2^3 combinations below
		_points[ 0 ].set( this.min.x, this.min.y, this.min.z ).applyMatrix4( matrix ); // 000
		_points[ 1 ].set( this.min.x, this.min.y, this.max.z ).applyMatrix4( matrix ); // 001
		_points[ 2 ].set( this.min.x, this.max.y, this.min.z ).applyMatrix4( matrix ); // 010
		_points[ 3 ].set( this.min.x, this.max.y, this.max.z ).applyMatrix4( matrix ); // 011
		_points[ 4 ].set( this.max.x, this.min.y, this.min.z ).applyMatrix4( matrix ); // 100
		_points[ 5 ].set( this.max.x, this.min.y, this.max.z ).applyMatrix4( matrix ); // 101
		_points[ 6 ].set( this.max.x, this.max.y, this.min.z ).applyMatrix4( matrix ); // 110
		_points[ 7 ].set( this.max.x, this.max.y, this.max.z ).applyMatrix4( matrix ); // 111

		this.setFromPoints( _points );

		return this;

	}

	translate( offset ) {

		this.min.add( offset );
		this.max.add( offset );

		return this;

	}

	equals( box ) {

		return box.min.equals( this.min ) && box.max.equals( this.max );

	}

}

const _points = [
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3()
];

const _vector$1 = /*@__PURE__*/ new Vector3();

const _box$2 = /*@__PURE__*/ new Box3();

// triangle centered vertices

const _v0 = /*@__PURE__*/ new Vector3();
const _v1$3 = /*@__PURE__*/ new Vector3();
const _v2$1 = /*@__PURE__*/ new Vector3();

// triangle edge vectors

const _f0 = /*@__PURE__*/ new Vector3();
const _f1 = /*@__PURE__*/ new Vector3();
const _f2 = /*@__PURE__*/ new Vector3();

const _center = /*@__PURE__*/ new Vector3();
const _extents = /*@__PURE__*/ new Vector3();
const _triangleNormal = /*@__PURE__*/ new Vector3();
const _testAxis = /*@__PURE__*/ new Vector3();

function satForAxes( axes, v0, v1, v2, extents ) {

	for ( let i = 0, j = axes.length - 3; i <= j; i += 3 ) {

		_testAxis.fromArray( axes, i );
		// project the aabb onto the separating axis
		const r = extents.x * Math.abs( _testAxis.x ) + extents.y * Math.abs( _testAxis.y ) + extents.z * Math.abs( _testAxis.z );
		// project all 3 vertices of the triangle onto the separating axis
		const p0 = v0.dot( _testAxis );
		const p1 = v1.dot( _testAxis );
		const p2 = v2.dot( _testAxis );
		// actual test, basically see if either of the most extreme of the triangle points intersects r
		if ( Math.max( - Math.max( p0, p1, p2 ), Math.min( p0, p1, p2 ) ) > r ) {

			// points of the projected triangle are outside the projected half-length of the aabb
			// the axis is separating and we can exit
			return false;

		}

	}

	return true;

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

const _box$1 = /*@__PURE__*/ new Box3();
const _v1$2 = /*@__PURE__*/ new Vector3();
const _v2 = /*@__PURE__*/ new Vector3();

class Sphere {

	constructor( center = new Vector3(), radius = - 1 ) {

		this.center = center;
		this.radius = radius;

	}

	set( center, radius ) {

		this.center.copy( center );
		this.radius = radius;

		return this;

	}

	setFromPoints( points, optionalCenter ) {

		const center = this.center;

		if ( optionalCenter !== undefined ) {

			center.copy( optionalCenter );

		} else {

			_box$1.setFromPoints( points ).getCenter( center );

		}

		let maxRadiusSq = 0;

		for ( let i = 0, il = points.length; i < il; i ++ ) {

			maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( points[ i ] ) );

		}

		this.radius = Math.sqrt( maxRadiusSq );

		return this;

	}

	copy( sphere ) {

		this.center.copy( sphere.center );
		this.radius = sphere.radius;

		return this;

	}

	isEmpty() {

		return ( this.radius < 0 );

	}

	makeEmpty() {

		this.center.set( 0, 0, 0 );
		this.radius = - 1;

		return this;

	}

	containsPoint( point ) {

		return ( point.distanceToSquared( this.center ) <= ( this.radius * this.radius ) );

	}

	distanceToPoint( point ) {

		return ( point.distanceTo( this.center ) - this.radius );

	}

	intersectsSphere( sphere ) {

		const radiusSum = this.radius + sphere.radius;

		return sphere.center.distanceToSquared( this.center ) <= ( radiusSum * radiusSum );

	}

	intersectsBox( box ) {

		return box.intersectsSphere( this );

	}

	intersectsPlane( plane ) {

		return Math.abs( plane.distanceToPoint( this.center ) ) <= this.radius;

	}

	clampPoint( point, target ) {

		const deltaLengthSq = this.center.distanceToSquared( point );

		target.copy( point );

		if ( deltaLengthSq > ( this.radius * this.radius ) ) {

			target.sub( this.center ).normalize();
			target.multiplyScalar( this.radius ).add( this.center );

		}

		return target;

	}

	getBoundingBox( target ) {

		if ( this.isEmpty() ) {

			// Empty sphere produces empty bounding box
			target.makeEmpty();
			return target;

		}

		target.set( this.center, this.center );
		target.expandByScalar( this.radius );

		return target;

	}

	applyMatrix4( matrix ) {

		this.center.applyMatrix4( matrix );
		this.radius = this.radius * matrix.getMaxScaleOnAxis();

		return this;

	}

	translate( offset ) {

		this.center.add( offset );

		return this;

	}

	expandByPoint( point ) {

		if ( this.isEmpty() ) {

			this.center.copy( point );

			this.radius = 0;

			return this;

		}

		_v1$2.subVectors( point, this.center );

		const lengthSq = _v1$2.lengthSq();

		if ( lengthSq > ( this.radius * this.radius ) ) {

			// calculate the minimal sphere

			const length = Math.sqrt( lengthSq );

			const delta = ( length - this.radius ) * 0.5;

			this.center.addScaledVector( _v1$2, delta / length );

			this.radius += delta;

		}

		return this;

	}

	union( sphere ) {

		if ( sphere.isEmpty() ) {

			return this;

		}

		if ( this.isEmpty() ) {

			this.copy( sphere );

			return this;

		}

		if ( this.center.equals( sphere.center ) === true ) {

			 this.radius = Math.max( this.radius, sphere.radius );

		} else {

			_v2.subVectors( sphere.center, this.center ).setLength( sphere.radius );

			this.expandByPoint( _v1$2.copy( sphere.center ).add( _v2 ) );

			this.expandByPoint( _v1$2.copy( sphere.center ).sub( _v2 ) );

		}

		return this;

	}

	equals( sphere ) {

		return sphere.center.equals( this.center ) && ( sphere.radius === this.radius );

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

class Matrix4 {

	constructor( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		Matrix4.prototype.isMatrix4 = true;

		this.elements = [

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		];

		if ( n11 !== undefined ) {

			this.set( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 );

		}

	}

	set( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		const te = this.elements;

		te[ 0 ] = n11; te[ 4 ] = n12; te[ 8 ] = n13; te[ 12 ] = n14;
		te[ 1 ] = n21; te[ 5 ] = n22; te[ 9 ] = n23; te[ 13 ] = n24;
		te[ 2 ] = n31; te[ 6 ] = n32; te[ 10 ] = n33; te[ 14 ] = n34;
		te[ 3 ] = n41; te[ 7 ] = n42; te[ 11 ] = n43; te[ 15 ] = n44;

		return this;

	}

	identity() {

		this.set(

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	}

	clone() {

		return new Matrix4().fromArray( this.elements );

	}

	copy( m ) {

		const te = this.elements;
		const me = m.elements;

		te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ]; te[ 3 ] = me[ 3 ];
		te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ]; te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ];
		te[ 8 ] = me[ 8 ]; te[ 9 ] = me[ 9 ]; te[ 10 ] = me[ 10 ]; te[ 11 ] = me[ 11 ];
		te[ 12 ] = me[ 12 ]; te[ 13 ] = me[ 13 ]; te[ 14 ] = me[ 14 ]; te[ 15 ] = me[ 15 ];

		return this;

	}

	copyPosition( m ) {

		const te = this.elements, me = m.elements;

		te[ 12 ] = me[ 12 ];
		te[ 13 ] = me[ 13 ];
		te[ 14 ] = me[ 14 ];

		return this;

	}

	setFromMatrix3( m ) {

		const me = m.elements;

		this.set(

			me[ 0 ], me[ 3 ], me[ 6 ], 0,
			me[ 1 ], me[ 4 ], me[ 7 ], 0,
			me[ 2 ], me[ 5 ], me[ 8 ], 0,
			0, 0, 0, 1

		);

		return this;

	}

	extractBasis( xAxis, yAxis, zAxis ) {

		xAxis.setFromMatrixColumn( this, 0 );
		yAxis.setFromMatrixColumn( this, 1 );
		zAxis.setFromMatrixColumn( this, 2 );

		return this;

	}

	makeBasis( xAxis, yAxis, zAxis ) {

		this.set(
			xAxis.x, yAxis.x, zAxis.x, 0,
			xAxis.y, yAxis.y, zAxis.y, 0,
			xAxis.z, yAxis.z, zAxis.z, 0,
			0, 0, 0, 1
		);

		return this;

	}

	extractRotation( m ) {

		// this method does not support reflection matrices

		const te = this.elements;
		const me = m.elements;

		const scaleX = 1 / _v1$1.setFromMatrixColumn( m, 0 ).length();
		const scaleY = 1 / _v1$1.setFromMatrixColumn( m, 1 ).length();
		const scaleZ = 1 / _v1$1.setFromMatrixColumn( m, 2 ).length();

		te[ 0 ] = me[ 0 ] * scaleX;
		te[ 1 ] = me[ 1 ] * scaleX;
		te[ 2 ] = me[ 2 ] * scaleX;
		te[ 3 ] = 0;

		te[ 4 ] = me[ 4 ] * scaleY;
		te[ 5 ] = me[ 5 ] * scaleY;
		te[ 6 ] = me[ 6 ] * scaleY;
		te[ 7 ] = 0;

		te[ 8 ] = me[ 8 ] * scaleZ;
		te[ 9 ] = me[ 9 ] * scaleZ;
		te[ 10 ] = me[ 10 ] * scaleZ;
		te[ 11 ] = 0;

		te[ 12 ] = 0;
		te[ 13 ] = 0;
		te[ 14 ] = 0;
		te[ 15 ] = 1;

		return this;

	}

	makeRotationFromEuler( euler ) {

		const te = this.elements;

		const x = euler.x, y = euler.y, z = euler.z;
		const a = Math.cos( x ), b = Math.sin( x );
		const c = Math.cos( y ), d = Math.sin( y );
		const e = Math.cos( z ), f = Math.sin( z );

		if ( euler.order === 'XYZ' ) {

			const ae = a * e, af = a * f, be = b * e, bf = b * f;

			te[ 0 ] = c * e;
			te[ 4 ] = - c * f;
			te[ 8 ] = d;

			te[ 1 ] = af + be * d;
			te[ 5 ] = ae - bf * d;
			te[ 9 ] = - b * c;

			te[ 2 ] = bf - ae * d;
			te[ 6 ] = be + af * d;
			te[ 10 ] = a * c;

		} else if ( euler.order === 'YXZ' ) {

			const ce = c * e, cf = c * f, de = d * e, df = d * f;

			te[ 0 ] = ce + df * b;
			te[ 4 ] = de * b - cf;
			te[ 8 ] = a * d;

			te[ 1 ] = a * f;
			te[ 5 ] = a * e;
			te[ 9 ] = - b;

			te[ 2 ] = cf * b - de;
			te[ 6 ] = df + ce * b;
			te[ 10 ] = a * c;

		} else if ( euler.order === 'ZXY' ) {

			const ce = c * e, cf = c * f, de = d * e, df = d * f;

			te[ 0 ] = ce - df * b;
			te[ 4 ] = - a * f;
			te[ 8 ] = de + cf * b;

			te[ 1 ] = cf + de * b;
			te[ 5 ] = a * e;
			te[ 9 ] = df - ce * b;

			te[ 2 ] = - a * d;
			te[ 6 ] = b;
			te[ 10 ] = a * c;

		} else if ( euler.order === 'ZYX' ) {

			const ae = a * e, af = a * f, be = b * e, bf = b * f;

			te[ 0 ] = c * e;
			te[ 4 ] = be * d - af;
			te[ 8 ] = ae * d + bf;

			te[ 1 ] = c * f;
			te[ 5 ] = bf * d + ae;
			te[ 9 ] = af * d - be;

			te[ 2 ] = - d;
			te[ 6 ] = b * c;
			te[ 10 ] = a * c;

		} else if ( euler.order === 'YZX' ) {

			const ac = a * c, ad = a * d, bc = b * c, bd = b * d;

			te[ 0 ] = c * e;
			te[ 4 ] = bd - ac * f;
			te[ 8 ] = bc * f + ad;

			te[ 1 ] = f;
			te[ 5 ] = a * e;
			te[ 9 ] = - b * e;

			te[ 2 ] = - d * e;
			te[ 6 ] = ad * f + bc;
			te[ 10 ] = ac - bd * f;

		} else if ( euler.order === 'XZY' ) {

			const ac = a * c, ad = a * d, bc = b * c, bd = b * d;

			te[ 0 ] = c * e;
			te[ 4 ] = - f;
			te[ 8 ] = d * e;

			te[ 1 ] = ac * f + bd;
			te[ 5 ] = a * e;
			te[ 9 ] = ad * f - bc;

			te[ 2 ] = bc * f - ad;
			te[ 6 ] = b * e;
			te[ 10 ] = bd * f + ac;

		}

		// bottom row
		te[ 3 ] = 0;
		te[ 7 ] = 0;
		te[ 11 ] = 0;

		// last column
		te[ 12 ] = 0;
		te[ 13 ] = 0;
		te[ 14 ] = 0;
		te[ 15 ] = 1;

		return this;

	}

	makeRotationFromQuaternion( q ) {

		return this.compose( _zero, q, _one );

	}

	lookAt( eye, target, up ) {

		const te = this.elements;

		_z.subVectors( eye, target );

		if ( _z.lengthSq() === 0 ) {

			// eye and target are in the same position

			_z.z = 1;

		}

		_z.normalize();
		_x.crossVectors( up, _z );

		if ( _x.lengthSq() === 0 ) {

			// up and z are parallel

			if ( Math.abs( up.z ) === 1 ) {

				_z.x += 0.0001;

			} else {

				_z.z += 0.0001;

			}

			_z.normalize();
			_x.crossVectors( up, _z );

		}

		_x.normalize();
		_y.crossVectors( _z, _x );

		te[ 0 ] = _x.x; te[ 4 ] = _y.x; te[ 8 ] = _z.x;
		te[ 1 ] = _x.y; te[ 5 ] = _y.y; te[ 9 ] = _z.y;
		te[ 2 ] = _x.z; te[ 6 ] = _y.z; te[ 10 ] = _z.z;

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

		const a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
		const a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
		const a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
		const a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

		const b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
		const b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
		const b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
		const b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

		te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		te[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		te[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		te[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		te[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		te[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		te[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		te[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		te[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		te[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		te[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		te[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		te[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		te[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

		return this;

	}

	multiplyScalar( s ) {

		const te = this.elements;

		te[ 0 ] *= s; te[ 4 ] *= s; te[ 8 ] *= s; te[ 12 ] *= s;
		te[ 1 ] *= s; te[ 5 ] *= s; te[ 9 ] *= s; te[ 13 ] *= s;
		te[ 2 ] *= s; te[ 6 ] *= s; te[ 10 ] *= s; te[ 14 ] *= s;
		te[ 3 ] *= s; te[ 7 ] *= s; te[ 11 ] *= s; te[ 15 ] *= s;

		return this;

	}

	determinant() {

		const te = this.elements;

		const n11 = te[ 0 ], n12 = te[ 4 ], n13 = te[ 8 ], n14 = te[ 12 ];
		const n21 = te[ 1 ], n22 = te[ 5 ], n23 = te[ 9 ], n24 = te[ 13 ];
		const n31 = te[ 2 ], n32 = te[ 6 ], n33 = te[ 10 ], n34 = te[ 14 ];
		const n41 = te[ 3 ], n42 = te[ 7 ], n43 = te[ 11 ], n44 = te[ 15 ];

		//TODO: make this more efficient
		//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

		return (
			n41 * (
				+ n14 * n23 * n32
				 - n13 * n24 * n32
				 - n14 * n22 * n33
				 + n12 * n24 * n33
				 + n13 * n22 * n34
				 - n12 * n23 * n34
			) +
			n42 * (
				+ n11 * n23 * n34
				 - n11 * n24 * n33
				 + n14 * n21 * n33
				 - n13 * n21 * n34
				 + n13 * n24 * n31
				 - n14 * n23 * n31
			) +
			n43 * (
				+ n11 * n24 * n32
				 - n11 * n22 * n34
				 - n14 * n21 * n32
				 + n12 * n21 * n34
				 + n14 * n22 * n31
				 - n12 * n24 * n31
			) +
			n44 * (
				- n13 * n22 * n31
				 - n11 * n23 * n32
				 + n11 * n22 * n33
				 + n13 * n21 * n32
				 - n12 * n21 * n33
				 + n12 * n23 * n31
			)

		);

	}

	transpose() {

		const te = this.elements;
		let tmp;

		tmp = te[ 1 ]; te[ 1 ] = te[ 4 ]; te[ 4 ] = tmp;
		tmp = te[ 2 ]; te[ 2 ] = te[ 8 ]; te[ 8 ] = tmp;
		tmp = te[ 6 ]; te[ 6 ] = te[ 9 ]; te[ 9 ] = tmp;

		tmp = te[ 3 ]; te[ 3 ] = te[ 12 ]; te[ 12 ] = tmp;
		tmp = te[ 7 ]; te[ 7 ] = te[ 13 ]; te[ 13 ] = tmp;
		tmp = te[ 11 ]; te[ 11 ] = te[ 14 ]; te[ 14 ] = tmp;

		return this;

	}

	setPosition( x, y, z ) {

		const te = this.elements;

		if ( x.isVector3 ) {

			te[ 12 ] = x.x;
			te[ 13 ] = x.y;
			te[ 14 ] = x.z;

		} else {

			te[ 12 ] = x;
			te[ 13 ] = y;
			te[ 14 ] = z;

		}

		return this;

	}

	invert() {

		// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
		const te = this.elements,

			n11 = te[ 0 ], n21 = te[ 1 ], n31 = te[ 2 ], n41 = te[ 3 ],
			n12 = te[ 4 ], n22 = te[ 5 ], n32 = te[ 6 ], n42 = te[ 7 ],
			n13 = te[ 8 ], n23 = te[ 9 ], n33 = te[ 10 ], n43 = te[ 11 ],
			n14 = te[ 12 ], n24 = te[ 13 ], n34 = te[ 14 ], n44 = te[ 15 ],

			t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
			t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
			t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
			t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

		const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

		if ( det === 0 ) return this.set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

		const detInv = 1 / det;

		te[ 0 ] = t11 * detInv;
		te[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
		te[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
		te[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

		te[ 4 ] = t12 * detInv;
		te[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
		te[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
		te[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

		te[ 8 ] = t13 * detInv;
		te[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
		te[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
		te[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

		te[ 12 ] = t14 * detInv;
		te[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
		te[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
		te[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;

		return this;

	}

	scale( v ) {

		const te = this.elements;
		const x = v.x, y = v.y, z = v.z;

		te[ 0 ] *= x; te[ 4 ] *= y; te[ 8 ] *= z;
		te[ 1 ] *= x; te[ 5 ] *= y; te[ 9 ] *= z;
		te[ 2 ] *= x; te[ 6 ] *= y; te[ 10 ] *= z;
		te[ 3 ] *= x; te[ 7 ] *= y; te[ 11 ] *= z;

		return this;

	}

	getMaxScaleOnAxis() {

		const te = this.elements;

		const scaleXSq = te[ 0 ] * te[ 0 ] + te[ 1 ] * te[ 1 ] + te[ 2 ] * te[ 2 ];
		const scaleYSq = te[ 4 ] * te[ 4 ] + te[ 5 ] * te[ 5 ] + te[ 6 ] * te[ 6 ];
		const scaleZSq = te[ 8 ] * te[ 8 ] + te[ 9 ] * te[ 9 ] + te[ 10 ] * te[ 10 ];

		return Math.sqrt( Math.max( scaleXSq, scaleYSq, scaleZSq ) );

	}

	makeTranslation( x, y, z ) {

		if ( x.isVector3 ) {

			this.set(

				1, 0, 0, x.x,
				0, 1, 0, x.y,
				0, 0, 1, x.z,
				0, 0, 0, 1

			);

		} else {

			this.set(

				1, 0, 0, x,
				0, 1, 0, y,
				0, 0, 1, z,
				0, 0, 0, 1

			);

		}

		return this;

	}

	makeRotationX( theta ) {

		const c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			1, 0, 0, 0,
			0, c, - s, 0,
			0, s, c, 0,
			0, 0, 0, 1

		);

		return this;

	}

	makeRotationY( theta ) {

		const c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			 c, 0, s, 0,
			 0, 1, 0, 0,
			- s, 0, c, 0,
			 0, 0, 0, 1

		);

		return this;

	}

	makeRotationZ( theta ) {

		const c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			c, - s, 0, 0,
			s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	}

	makeRotationAxis( axis, angle ) {

		// Based on http://www.gamedev.net/reference/articles/article1199.asp

		const c = Math.cos( angle );
		const s = Math.sin( angle );
		const t = 1 - c;
		const x = axis.x, y = axis.y, z = axis.z;
		const tx = t * x, ty = t * y;

		this.set(

			tx * x + c, tx * y - s * z, tx * z + s * y, 0,
			tx * y + s * z, ty * y + c, ty * z - s * x, 0,
			tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
			0, 0, 0, 1

		);

		return this;

	}

	makeScale( x, y, z ) {

		this.set(

			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1

		);

		return this;

	}

	makeShear( xy, xz, yx, yz, zx, zy ) {

		this.set(

			1, yx, zx, 0,
			xy, 1, zy, 0,
			xz, yz, 1, 0,
			0, 0, 0, 1

		);

		return this;

	}

	compose( position, quaternion, scale ) {

		const te = this.elements;

		const x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
		const x2 = x + x,	y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2;
		const yy = y * y2, yz = y * z2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;

		const sx = scale.x, sy = scale.y, sz = scale.z;

		te[ 0 ] = ( 1 - ( yy + zz ) ) * sx;
		te[ 1 ] = ( xy + wz ) * sx;
		te[ 2 ] = ( xz - wy ) * sx;
		te[ 3 ] = 0;

		te[ 4 ] = ( xy - wz ) * sy;
		te[ 5 ] = ( 1 - ( xx + zz ) ) * sy;
		te[ 6 ] = ( yz + wx ) * sy;
		te[ 7 ] = 0;

		te[ 8 ] = ( xz + wy ) * sz;
		te[ 9 ] = ( yz - wx ) * sz;
		te[ 10 ] = ( 1 - ( xx + yy ) ) * sz;
		te[ 11 ] = 0;

		te[ 12 ] = position.x;
		te[ 13 ] = position.y;
		te[ 14 ] = position.z;
		te[ 15 ] = 1;

		return this;

	}

	decompose( position, quaternion, scale ) {

		const te = this.elements;

		let sx = _v1$1.set( te[ 0 ], te[ 1 ], te[ 2 ] ).length();
		const sy = _v1$1.set( te[ 4 ], te[ 5 ], te[ 6 ] ).length();
		const sz = _v1$1.set( te[ 8 ], te[ 9 ], te[ 10 ] ).length();

		// if determine is negative, we need to invert one scale
		const det = this.determinant();
		if ( det < 0 ) sx = - sx;

		position.x = te[ 12 ];
		position.y = te[ 13 ];
		position.z = te[ 14 ];

		// scale the rotation part
		_m1$2.copy( this );

		const invSX = 1 / sx;
		const invSY = 1 / sy;
		const invSZ = 1 / sz;

		_m1$2.elements[ 0 ] *= invSX;
		_m1$2.elements[ 1 ] *= invSX;
		_m1$2.elements[ 2 ] *= invSX;

		_m1$2.elements[ 4 ] *= invSY;
		_m1$2.elements[ 5 ] *= invSY;
		_m1$2.elements[ 6 ] *= invSY;

		_m1$2.elements[ 8 ] *= invSZ;
		_m1$2.elements[ 9 ] *= invSZ;
		_m1$2.elements[ 10 ] *= invSZ;

		quaternion.setFromRotationMatrix( _m1$2 );

		scale.x = sx;
		scale.y = sy;
		scale.z = sz;

		return this;

	}

	makePerspective( left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem ) {

		const te = this.elements;
		const x = 2 * near / ( right - left );
		const y = 2 * near / ( top - bottom );

		const a = ( right + left ) / ( right - left );
		const b = ( top + bottom ) / ( top - bottom );

		let c, d;

		if ( coordinateSystem === WebGLCoordinateSystem ) {

			c = - ( far + near ) / ( far - near );
			d = ( - 2 * far * near ) / ( far - near );

		} else if ( coordinateSystem === WebGPUCoordinateSystem ) {

			c = - far / ( far - near );
			d = ( - far * near ) / ( far - near );

		} else {

			throw new Error( 'THREE.Matrix4.makePerspective(): Invalid coordinate system: ' + coordinateSystem );

		}

		te[ 0 ] = x;	te[ 4 ] = 0;	te[ 8 ] = a; 	te[ 12 ] = 0;
		te[ 1 ] = 0;	te[ 5 ] = y;	te[ 9 ] = b; 	te[ 13 ] = 0;
		te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = c; 	te[ 14 ] = d;
		te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = - 1;	te[ 15 ] = 0;

		return this;

	}

	makeOrthographic( left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem ) {

		const te = this.elements;
		const w = 1.0 / ( right - left );
		const h = 1.0 / ( top - bottom );
		const p = 1.0 / ( far - near );

		const x = ( right + left ) * w;
		const y = ( top + bottom ) * h;

		let z, zInv;

		if ( coordinateSystem === WebGLCoordinateSystem ) {

			z = ( far + near ) * p;
			zInv = - 2 * p;

		} else if ( coordinateSystem === WebGPUCoordinateSystem ) {

			z = near * p;
			zInv = - 1 * p;

		} else {

			throw new Error( 'THREE.Matrix4.makeOrthographic(): Invalid coordinate system: ' + coordinateSystem );

		}

		te[ 0 ] = 2 * w;	te[ 4 ] = 0;		te[ 8 ] = 0; 		te[ 12 ] = - x;
		te[ 1 ] = 0; 		te[ 5 ] = 2 * h;	te[ 9 ] = 0; 		te[ 13 ] = - y;
		te[ 2 ] = 0; 		te[ 6 ] = 0;		te[ 10 ] = zInv;	te[ 14 ] = - z;
		te[ 3 ] = 0; 		te[ 7 ] = 0;		te[ 11 ] = 0;		te[ 15 ] = 1;

		return this;

	}

	equals( matrix ) {

		const te = this.elements;
		const me = matrix.elements;

		for ( let i = 0; i < 16; i ++ ) {

			if ( te[ i ] !== me[ i ] ) return false;

		}

		return true;

	}

	fromArray( array, offset = 0 ) {

		for ( let i = 0; i < 16; i ++ ) {

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
		array[ offset + 9 ] = te[ 9 ];
		array[ offset + 10 ] = te[ 10 ];
		array[ offset + 11 ] = te[ 11 ];

		array[ offset + 12 ] = te[ 12 ];
		array[ offset + 13 ] = te[ 13 ];
		array[ offset + 14 ] = te[ 14 ];
		array[ offset + 15 ] = te[ 15 ];

		return array;

	}

}

const _v1$1 = /*@__PURE__*/ new Vector3();
const _m1$2 = /*@__PURE__*/ new Matrix4();
const _zero = /*@__PURE__*/ new Vector3( 0, 0, 0 );
const _one = /*@__PURE__*/ new Vector3( 1, 1, 1 );
const _x = /*@__PURE__*/ new Vector3();
const _y = /*@__PURE__*/ new Vector3();
const _z = /*@__PURE__*/ new Vector3();

const _matrix = /*@__PURE__*/ new Matrix4();
const _quaternion$1 = /*@__PURE__*/ new Quaternion();

class Euler {

	constructor( x = 0, y = 0, z = 0, order = Euler.DEFAULT_ORDER ) {

		this.isEuler = true;

		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;

	}

	get x() {

		return this._x;

	}

	set x( value ) {

		this._x = value;
		this._onChangeCallback();

	}

	get y() {

		return this._y;

	}

	set y( value ) {

		this._y = value;
		this._onChangeCallback();

	}

	get z() {

		return this._z;

	}

	set z( value ) {

		this._z = value;
		this._onChangeCallback();

	}

	get order() {

		return this._order;

	}

	set order( value ) {

		this._order = value;
		this._onChangeCallback();

	}

	set( x, y, z, order = this._order ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;

		this._onChangeCallback();

		return this;

	}

	clone() {

		return new this.constructor( this._x, this._y, this._z, this._order );

	}

	copy( euler ) {

		this._x = euler._x;
		this._y = euler._y;
		this._z = euler._z;
		this._order = euler._order;

		this._onChangeCallback();

		return this;

	}

	setFromRotationMatrix( m, order = this._order, update = true ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		const te = m.elements;
		const m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ];
		const m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ];
		const m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];

		switch ( order ) {

			case 'XYZ':

				this._y = Math.asin( clamp( m13, - 1, 1 ) );

				if ( Math.abs( m13 ) < 0.9999999 ) {

					this._x = Math.atan2( - m23, m33 );
					this._z = Math.atan2( - m12, m11 );

				} else {

					this._x = Math.atan2( m32, m22 );
					this._z = 0;

				}

				break;

			case 'YXZ':

				this._x = Math.asin( - clamp( m23, - 1, 1 ) );

				if ( Math.abs( m23 ) < 0.9999999 ) {

					this._y = Math.atan2( m13, m33 );
					this._z = Math.atan2( m21, m22 );

				} else {

					this._y = Math.atan2( - m31, m11 );
					this._z = 0;

				}

				break;

			case 'ZXY':

				this._x = Math.asin( clamp( m32, - 1, 1 ) );

				if ( Math.abs( m32 ) < 0.9999999 ) {

					this._y = Math.atan2( - m31, m33 );
					this._z = Math.atan2( - m12, m22 );

				} else {

					this._y = 0;
					this._z = Math.atan2( m21, m11 );

				}

				break;

			case 'ZYX':

				this._y = Math.asin( - clamp( m31, - 1, 1 ) );

				if ( Math.abs( m31 ) < 0.9999999 ) {

					this._x = Math.atan2( m32, m33 );
					this._z = Math.atan2( m21, m11 );

				} else {

					this._x = 0;
					this._z = Math.atan2( - m12, m22 );

				}

				break;

			case 'YZX':

				this._z = Math.asin( clamp( m21, - 1, 1 ) );

				if ( Math.abs( m21 ) < 0.9999999 ) {

					this._x = Math.atan2( - m23, m22 );
					this._y = Math.atan2( - m31, m11 );

				} else {

					this._x = 0;
					this._y = Math.atan2( m13, m33 );

				}

				break;

			case 'XZY':

				this._z = Math.asin( - clamp( m12, - 1, 1 ) );

				if ( Math.abs( m12 ) < 0.9999999 ) {

					this._x = Math.atan2( m32, m22 );
					this._y = Math.atan2( m13, m11 );

				} else {

					this._x = Math.atan2( - m23, m33 );
					this._y = 0;

				}

				break;

			default:

				console.warn( 'THREE.Euler: .setFromRotationMatrix() encountered an unknown order: ' + order );

		}

		this._order = order;

		if ( update === true ) this._onChangeCallback();

		return this;

	}

	setFromQuaternion( q, order, update ) {

		_matrix.makeRotationFromQuaternion( q );

		return this.setFromRotationMatrix( _matrix, order, update );

	}

	setFromVector3( v, order = this._order ) {

		return this.set( v.x, v.y, v.z, order );

	}

	reorder( newOrder ) {

		// WARNING: this discards revolution information -bhouston

		_quaternion$1.setFromEuler( this );

		return this.setFromQuaternion( _quaternion$1, newOrder );

	}

	equals( euler ) {

		return ( euler._x === this._x ) && ( euler._y === this._y ) && ( euler._z === this._z ) && ( euler._order === this._order );

	}

	fromArray( array ) {

		this._x = array[ 0 ];
		this._y = array[ 1 ];
		this._z = array[ 2 ];
		if ( array[ 3 ] !== undefined ) this._order = array[ 3 ];

		this._onChangeCallback();

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._order;

		return array;

	}

	_onChange( callback ) {

		this._onChangeCallback = callback;

		return this;

	}

	_onChangeCallback() {}

	*[ Symbol.iterator ]() {

		yield this._x;
		yield this._y;
		yield this._z;
		yield this._order;

	}

}

Euler.DEFAULT_ORDER = 'XYZ';

class Layers {

	constructor() {

		this.mask = 1 | 0;

	}

	set( channel ) {

		this.mask = ( 1 << channel | 0 ) >>> 0;

	}

	enable( channel ) {

		this.mask |= 1 << channel | 0;

	}

	enableAll() {

		this.mask = 0xffffffff | 0;

	}

	toggle( channel ) {

		this.mask ^= 1 << channel | 0;

	}

	disable( channel ) {

		this.mask &= ~ ( 1 << channel | 0 );

	}

	disableAll() {

		this.mask = 0;

	}

	test( layers ) {

		return ( this.mask & layers.mask ) !== 0;

	}

	isEnabled( channel ) {

		return ( this.mask & ( 1 << channel | 0 ) ) !== 0;

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

let _object3DId = 0;

const _v1 = /*@__PURE__*/ new Vector3();
const _q1 = /*@__PURE__*/ new Quaternion();
const _m1$1 = /*@__PURE__*/ new Matrix4();
const _target = /*@__PURE__*/ new Vector3();

const _position = /*@__PURE__*/ new Vector3();
const _scale = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();

const _xAxis = /*@__PURE__*/ new Vector3( 1, 0, 0 );
const _yAxis = /*@__PURE__*/ new Vector3( 0, 1, 0 );
const _zAxis = /*@__PURE__*/ new Vector3( 0, 0, 1 );

const _addedEvent = { type: 'added' };
const _removedEvent = { type: 'removed' };

class Object3D extends EventDispatcher {

	constructor() {

		super();

		this.isObject3D = true;

		Object.defineProperty( this, 'id', { value: _object3DId ++ } );

		this.uuid = generateUUID();

		this.name = '';
		this.type = 'Object3D';

		this.parent = null;
		this.children = [];

		this.up = Object3D.DEFAULT_UP.clone();

		const position = new Vector3();
		const rotation = new Euler();
		const quaternion = new Quaternion();
		const scale = new Vector3( 1, 1, 1 );

		function onRotationChange() {

			quaternion.setFromEuler( rotation, false );

		}

		function onQuaternionChange() {

			rotation.setFromQuaternion( quaternion, undefined, false );

		}

		rotation._onChange( onRotationChange );
		quaternion._onChange( onQuaternionChange );

		Object.defineProperties( this, {
			position: {
				configurable: true,
				enumerable: true,
				value: position
			},
			rotation: {
				configurable: true,
				enumerable: true,
				value: rotation
			},
			quaternion: {
				configurable: true,
				enumerable: true,
				value: quaternion
			},
			scale: {
				configurable: true,
				enumerable: true,
				value: scale
			},
			modelViewMatrix: {
				value: new Matrix4()
			},
			normalMatrix: {
				value: new Matrix3()
			}
		} );

		this.matrix = new Matrix4();
		this.matrixWorld = new Matrix4();

		this.matrixAutoUpdate = Object3D.DEFAULT_MATRIX_AUTO_UPDATE;
		this.matrixWorldNeedsUpdate = false;

		this.matrixWorldAutoUpdate = Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE; // checked by the renderer

		this.layers = new Layers();
		this.visible = true;

		this.castShadow = false;
		this.receiveShadow = false;

		this.frustumCulled = true;
		this.renderOrder = 0;

		this.animations = [];

		this.userData = {};

	}

	onBeforeRender( /* renderer, scene, camera, geometry, material, group */ ) {}

	onAfterRender( /* renderer, scene, camera, geometry, material, group */ ) {}

	applyMatrix4( matrix ) {

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		this.matrix.premultiply( matrix );

		this.matrix.decompose( this.position, this.quaternion, this.scale );

	}

	applyQuaternion( q ) {

		this.quaternion.premultiply( q );

		return this;

	}

	setRotationFromAxisAngle( axis, angle ) {

		// assumes axis is normalized

		this.quaternion.setFromAxisAngle( axis, angle );

	}

	setRotationFromEuler( euler ) {

		this.quaternion.setFromEuler( euler, true );

	}

	setRotationFromMatrix( m ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		this.quaternion.setFromRotationMatrix( m );

	}

	setRotationFromQuaternion( q ) {

		// assumes q is normalized

		this.quaternion.copy( q );

	}

	rotateOnAxis( axis, angle ) {

		// rotate object on axis in object space
		// axis is assumed to be normalized

		_q1.setFromAxisAngle( axis, angle );

		this.quaternion.multiply( _q1 );

		return this;

	}

	rotateOnWorldAxis( axis, angle ) {

		// rotate object on axis in world space
		// axis is assumed to be normalized
		// method assumes no rotated parent

		_q1.setFromAxisAngle( axis, angle );

		this.quaternion.premultiply( _q1 );

		return this;

	}

	rotateX( angle ) {

		return this.rotateOnAxis( _xAxis, angle );

	}

	rotateY( angle ) {

		return this.rotateOnAxis( _yAxis, angle );

	}

	rotateZ( angle ) {

		return this.rotateOnAxis( _zAxis, angle );

	}

	translateOnAxis( axis, distance ) {

		// translate object by distance along axis in object space
		// axis is assumed to be normalized

		_v1.copy( axis ).applyQuaternion( this.quaternion );

		this.position.add( _v1.multiplyScalar( distance ) );

		return this;

	}

	translateX( distance ) {

		return this.translateOnAxis( _xAxis, distance );

	}

	translateY( distance ) {

		return this.translateOnAxis( _yAxis, distance );

	}

	translateZ( distance ) {

		return this.translateOnAxis( _zAxis, distance );

	}

	localToWorld( vector ) {

		this.updateWorldMatrix( true, false );

		return vector.applyMatrix4( this.matrixWorld );

	}

	worldToLocal( vector ) {

		this.updateWorldMatrix( true, false );

		return vector.applyMatrix4( _m1$1.copy( this.matrixWorld ).invert() );

	}

	lookAt( x, y, z ) {

		// This method does not support objects having non-uniformly-scaled parent(s)

		if ( x.isVector3 ) {

			_target.copy( x );

		} else {

			_target.set( x, y, z );

		}

		const parent = this.parent;

		this.updateWorldMatrix( true, false );

		_position.setFromMatrixPosition( this.matrixWorld );

		if ( this.isCamera || this.isLight ) {

			_m1$1.lookAt( _position, _target, this.up );

		} else {

			_m1$1.lookAt( _target, _position, this.up );

		}

		this.quaternion.setFromRotationMatrix( _m1$1 );

		if ( parent ) {

			_m1$1.extractRotation( parent.matrixWorld );
			_q1.setFromRotationMatrix( _m1$1 );
			this.quaternion.premultiply( _q1.invert() );

		}

	}

	add( object ) {

		if ( arguments.length > 1 ) {

			for ( let i = 0; i < arguments.length; i ++ ) {

				this.add( arguments[ i ] );

			}

			return this;

		}

		if ( object === this ) {

			console.error( 'THREE.Object3D.add: object can\'t be added as a child of itself.', object );
			return this;

		}

		if ( object && object.isObject3D ) {

			if ( object.parent !== null ) {

				object.parent.remove( object );

			}

			object.parent = this;
			this.children.push( object );

			object.dispatchEvent( _addedEvent );

		} else {

			console.error( 'THREE.Object3D.add: object not an instance of THREE.Object3D.', object );

		}

		return this;

	}

	remove( object ) {

		if ( arguments.length > 1 ) {

			for ( let i = 0; i < arguments.length; i ++ ) {

				this.remove( arguments[ i ] );

			}

			return this;

		}

		const index = this.children.indexOf( object );

		if ( index !== - 1 ) {

			object.parent = null;
			this.children.splice( index, 1 );

			object.dispatchEvent( _removedEvent );

		}

		return this;

	}

	removeFromParent() {

		const parent = this.parent;

		if ( parent !== null ) {

			parent.remove( this );

		}

		return this;

	}

	clear() {

		for ( let i = 0; i < this.children.length; i ++ ) {

			const object = this.children[ i ];

			object.parent = null;

			object.dispatchEvent( _removedEvent );

		}

		this.children.length = 0;

		return this;


	}

	attach( object ) {

		// adds object as a child of this, while maintaining the object's world transform

		// Note: This method does not support scene graphs having non-uniformly-scaled nodes(s)

		this.updateWorldMatrix( true, false );

		_m1$1.copy( this.matrixWorld ).invert();

		if ( object.parent !== null ) {

			object.parent.updateWorldMatrix( true, false );

			_m1$1.multiply( object.parent.matrixWorld );

		}

		object.applyMatrix4( _m1$1 );

		this.add( object );

		object.updateWorldMatrix( false, true );

		return this;

	}

	getObjectById( id ) {

		return this.getObjectByProperty( 'id', id );

	}

	getObjectByName( name ) {

		return this.getObjectByProperty( 'name', name );

	}

	getObjectByProperty( name, value ) {

		if ( this[ name ] === value ) return this;

		for ( let i = 0, l = this.children.length; i < l; i ++ ) {

			const child = this.children[ i ];
			const object = child.getObjectByProperty( name, value );

			if ( object !== undefined ) {

				return object;

			}

		}

		return undefined;

	}

	getObjectsByProperty( name, value ) {

		let result = [];

		if ( this[ name ] === value ) result.push( this );

		for ( let i = 0, l = this.children.length; i < l; i ++ ) {

			const childResult = this.children[ i ].getObjectsByProperty( name, value );

			if ( childResult.length > 0 ) {

				result = result.concat( childResult );

			}

		}

		return result;

	}

	getWorldPosition( target ) {

		this.updateWorldMatrix( true, false );

		return target.setFromMatrixPosition( this.matrixWorld );

	}

	getWorldQuaternion( target ) {

		this.updateWorldMatrix( true, false );

		this.matrixWorld.decompose( _position, target, _scale );

		return target;

	}

	getWorldScale( target ) {

		this.updateWorldMatrix( true, false );

		this.matrixWorld.decompose( _position, _quaternion, target );

		return target;

	}

	getWorldDirection( target ) {

		this.updateWorldMatrix( true, false );

		const e = this.matrixWorld.elements;

		return target.set( e[ 8 ], e[ 9 ], e[ 10 ] ).normalize();

	}

	raycast( /* raycaster, intersects */ ) {}

	traverse( callback ) {

		callback( this );

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverse( callback );

		}

	}

	traverseVisible( callback ) {

		if ( this.visible === false ) return;

		callback( this );

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverseVisible( callback );

		}

	}

	traverseAncestors( callback ) {

		const parent = this.parent;

		if ( parent !== null ) {

			callback( parent );

			parent.traverseAncestors( callback );

		}

	}

	updateMatrix() {

		this.matrix.compose( this.position, this.quaternion, this.scale );

		this.matrixWorldNeedsUpdate = true;

	}

	updateMatrixWorld( force ) {

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		if ( this.matrixWorldNeedsUpdate || force ) {

			if ( this.parent === null ) {

				this.matrixWorld.copy( this.matrix );

			} else {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			const child = children[ i ];

			if ( child.matrixWorldAutoUpdate === true || force === true ) {

				child.updateMatrixWorld( force );

			}

		}

	}

	updateWorldMatrix( updateParents, updateChildren ) {

		const parent = this.parent;

		if ( updateParents === true && parent !== null && parent.matrixWorldAutoUpdate === true ) {

			parent.updateWorldMatrix( true, false );

		}

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		if ( this.parent === null ) {

			this.matrixWorld.copy( this.matrix );

		} else {

			this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

		}

		// update children

		if ( updateChildren === true ) {

			const children = this.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				const child = children[ i ];

				if ( child.matrixWorldAutoUpdate === true ) {

					child.updateWorldMatrix( false, true );

				}

			}

		}

	}

	toJSON( meta ) {

		// meta is a string when called from JSON.stringify
		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		const output = {};

		// meta is a hash used to collect geometries, materials.
		// not providing it implies that this is the root object
		// being serialized.
		if ( isRootObject ) {

			// initialize meta obj
			meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {},
				shapes: {},
				skeletons: {},
				animations: {},
				nodes: {}
			};

			output.metadata = {
				version: 4.6,
				type: 'Object',
				generator: 'Object3D.toJSON'
			};

		}

		// standard Object3D serialization

		const object = {};

		object.uuid = this.uuid;
		object.type = this.type;

		if ( this.name !== '' ) object.name = this.name;
		if ( this.castShadow === true ) object.castShadow = true;
		if ( this.receiveShadow === true ) object.receiveShadow = true;
		if ( this.visible === false ) object.visible = false;
		if ( this.frustumCulled === false ) object.frustumCulled = false;
		if ( this.renderOrder !== 0 ) object.renderOrder = this.renderOrder;
		if ( Object.keys( this.userData ).length > 0 ) object.userData = this.userData;

		object.layers = this.layers.mask;
		object.matrix = this.matrix.toArray();
		object.up = this.up.toArray();

		if ( this.matrixAutoUpdate === false ) object.matrixAutoUpdate = false;

		// object specific properties

		if ( this.isInstancedMesh ) {

			object.type = 'InstancedMesh';
			object.count = this.count;
			object.instanceMatrix = this.instanceMatrix.toJSON();
			if ( this.instanceColor !== null ) object.instanceColor = this.instanceColor.toJSON();

		}

		//

		function serialize( library, element ) {

			if ( library[ element.uuid ] === undefined ) {

				library[ element.uuid ] = element.toJSON( meta );

			}

			return element.uuid;

		}

		if ( this.isScene ) {

			if ( this.background ) {

				if ( this.background.isColor ) {

					object.background = this.background.toJSON();

				} else if ( this.background.isTexture ) {

					object.background = this.background.toJSON( meta ).uuid;

				}

			}

			if ( this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== true ) {

				object.environment = this.environment.toJSON( meta ).uuid;

			}

		} else if ( this.isMesh || this.isLine || this.isPoints ) {

			object.geometry = serialize( meta.geometries, this.geometry );

			const parameters = this.geometry.parameters;

			if ( parameters !== undefined && parameters.shapes !== undefined ) {

				const shapes = parameters.shapes;

				if ( Array.isArray( shapes ) ) {

					for ( let i = 0, l = shapes.length; i < l; i ++ ) {

						const shape = shapes[ i ];

						serialize( meta.shapes, shape );

					}

				} else {

					serialize( meta.shapes, shapes );

				}

			}

		}

		if ( this.isSkinnedMesh ) {

			object.bindMode = this.bindMode;
			object.bindMatrix = this.bindMatrix.toArray();

			if ( this.skeleton !== undefined ) {

				serialize( meta.skeletons, this.skeleton );

				object.skeleton = this.skeleton.uuid;

			}

		}

		if ( this.material !== undefined ) {

			if ( Array.isArray( this.material ) ) {

				const uuids = [];

				for ( let i = 0, l = this.material.length; i < l; i ++ ) {

					uuids.push( serialize( meta.materials, this.material[ i ] ) );

				}

				object.material = uuids;

			} else {

				object.material = serialize( meta.materials, this.material );

			}

		}

		//

		if ( this.children.length > 0 ) {

			object.children = [];

			for ( let i = 0; i < this.children.length; i ++ ) {

				object.children.push( this.children[ i ].toJSON( meta ).object );

			}

		}

		//

		if ( this.animations.length > 0 ) {

			object.animations = [];

			for ( let i = 0; i < this.animations.length; i ++ ) {

				const animation = this.animations[ i ];

				object.animations.push( serialize( meta.animations, animation ) );

			}

		}

		if ( isRootObject ) {

			const geometries = extractFromCache( meta.geometries );
			const materials = extractFromCache( meta.materials );
			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );
			const shapes = extractFromCache( meta.shapes );
			const skeletons = extractFromCache( meta.skeletons );
			const animations = extractFromCache( meta.animations );
			const nodes = extractFromCache( meta.nodes );

			if ( geometries.length > 0 ) output.geometries = geometries;
			if ( materials.length > 0 ) output.materials = materials;
			if ( textures.length > 0 ) output.textures = textures;
			if ( images.length > 0 ) output.images = images;
			if ( shapes.length > 0 ) output.shapes = shapes;
			if ( skeletons.length > 0 ) output.skeletons = skeletons;
			if ( animations.length > 0 ) output.animations = animations;
			if ( nodes.length > 0 ) output.nodes = nodes;

		}

		output.object = object;

		return output;

		// extract data from the cache hash
		// remove metadata on each item
		// and return as array
		function extractFromCache( cache ) {

			const values = [];
			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

	}

	clone( recursive ) {

		return new this.constructor().copy( this, recursive );

	}

	copy( source, recursive = true ) {

		this.name = source.name;

		this.up.copy( source.up );

		this.position.copy( source.position );
		this.rotation.order = source.rotation.order;
		this.quaternion.copy( source.quaternion );
		this.scale.copy( source.scale );

		this.matrix.copy( source.matrix );
		this.matrixWorld.copy( source.matrixWorld );

		this.matrixAutoUpdate = source.matrixAutoUpdate;
		this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

		this.matrixWorldAutoUpdate = source.matrixWorldAutoUpdate;

		this.layers.mask = source.layers.mask;
		this.visible = source.visible;

		this.castShadow = source.castShadow;
		this.receiveShadow = source.receiveShadow;

		this.frustumCulled = source.frustumCulled;
		this.renderOrder = source.renderOrder;

		this.animations = source.animations;

		this.userData = JSON.parse( JSON.stringify( source.userData ) );

		if ( recursive === true ) {

			for ( let i = 0; i < source.children.length; i ++ ) {

				const child = source.children[ i ];
				this.add( child.clone() );

			}

		}

		return this;

	}

}

Object3D.DEFAULT_UP = /*@__PURE__*/ new Vector3( 0, 1, 0 );
Object3D.DEFAULT_MATRIX_AUTO_UPDATE = true;
Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;

function arrayNeedsUint32( array ) {

	// assumes larger values usually on last

	for ( let i = array.length - 1; i >= 0; -- i ) {

		if ( array[ i ] >= 65535 ) return true; // account for PRIMITIVE_RESTART_FIXED_INDEX, #24565

	}

	return false;

}

let _id = 0;

const _m1 = /*@__PURE__*/ new Matrix4();
const _obj = /*@__PURE__*/ new Object3D();
const _offset = /*@__PURE__*/ new Vector3();
const _box = /*@__PURE__*/ new Box3();
const _boxMorphTargets = /*@__PURE__*/ new Box3();
const _vector = /*@__PURE__*/ new Vector3();

class BufferGeometry extends EventDispatcher {

	constructor() {

		super();

		this.isBufferGeometry = true;

		Object.defineProperty( this, 'id', { value: _id ++ } );

		this.uuid = generateUUID();

		this.name = '';
		this.type = 'BufferGeometry';

		this.index = null;
		this.attributes = {};

		this.morphAttributes = {};
		this.morphTargetsRelative = false;

		this.groups = [];

		this.boundingBox = null;
		this.boundingSphere = null;

		this.drawRange = { start: 0, count: Infinity };

		this.userData = {};

	}

	getIndex() {

		return this.index;

	}

	setIndex( index ) {

		if ( Array.isArray( index ) ) {

			this.index = new ( arrayNeedsUint32( index ) ? Uint32BufferAttribute : Uint16BufferAttribute )( index, 1 );

		} else {

			this.index = index;

		}

		return this;

	}

	getAttribute( name ) {

		return this.attributes[ name ];

	}

	setAttribute( name, attribute ) {

		this.attributes[ name ] = attribute;

		return this;

	}

	deleteAttribute( name ) {

		delete this.attributes[ name ];

		return this;

	}

	hasAttribute( name ) {

		return this.attributes[ name ] !== undefined;

	}

	addGroup( start, count, materialIndex = 0 ) {

		this.groups.push( {

			start: start,
			count: count,
			materialIndex: materialIndex

		} );

	}

	clearGroups() {

		this.groups = [];

	}

	setDrawRange( start, count ) {

		this.drawRange.start = start;
		this.drawRange.count = count;

	}

	applyMatrix4( matrix ) {

		const position = this.attributes.position;

		if ( position !== undefined ) {

			position.applyMatrix4( matrix );

			position.needsUpdate = true;

		}

		const normal = this.attributes.normal;

		if ( normal !== undefined ) {

			const normalMatrix = new Matrix3().getNormalMatrix( matrix );

			normal.applyNormalMatrix( normalMatrix );

			normal.needsUpdate = true;

		}

		const tangent = this.attributes.tangent;

		if ( tangent !== undefined ) {

			tangent.transformDirection( matrix );

			tangent.needsUpdate = true;

		}

		if ( this.boundingBox !== null ) {

			this.computeBoundingBox();

		}

		if ( this.boundingSphere !== null ) {

			this.computeBoundingSphere();

		}

		return this;

	}

	applyQuaternion( q ) {

		_m1.makeRotationFromQuaternion( q );

		this.applyMatrix4( _m1 );

		return this;

	}

	rotateX( angle ) {

		// rotate geometry around world x-axis

		_m1.makeRotationX( angle );

		this.applyMatrix4( _m1 );

		return this;

	}

	rotateY( angle ) {

		// rotate geometry around world y-axis

		_m1.makeRotationY( angle );

		this.applyMatrix4( _m1 );

		return this;

	}

	rotateZ( angle ) {

		// rotate geometry around world z-axis

		_m1.makeRotationZ( angle );

		this.applyMatrix4( _m1 );

		return this;

	}

	translate( x, y, z ) {

		// translate geometry

		_m1.makeTranslation( x, y, z );

		this.applyMatrix4( _m1 );

		return this;

	}

	scale( x, y, z ) {

		// scale geometry

		_m1.makeScale( x, y, z );

		this.applyMatrix4( _m1 );

		return this;

	}

	lookAt( vector ) {

		_obj.lookAt( vector );

		_obj.updateMatrix();

		this.applyMatrix4( _obj.matrix );

		return this;

	}

	center() {

		this.computeBoundingBox();

		this.boundingBox.getCenter( _offset ).negate();

		this.translate( _offset.x, _offset.y, _offset.z );

		return this;

	}

	setFromPoints( points ) {

		const position = [];

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			const point = points[ i ];
			position.push( point.x, point.y, point.z || 0 );

		}

		this.setAttribute( 'position', new Float32BufferAttribute( position, 3 ) );

		return this;

	}

	computeBoundingBox() {

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		const position = this.attributes.position;
		const morphAttributesPosition = this.morphAttributes.position;

		if ( position && position.isGLBufferAttribute ) {

			console.error( 'THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".', this );

			this.boundingBox.set(
				new Vector3( - Infinity, - Infinity, - Infinity ),
				new Vector3( + Infinity, + Infinity, + Infinity )
			);

			return;

		}

		if ( position !== undefined ) {

			this.boundingBox.setFromBufferAttribute( position );

			// process morph attributes if present

			if ( morphAttributesPosition ) {

				for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

					const morphAttribute = morphAttributesPosition[ i ];
					_box.setFromBufferAttribute( morphAttribute );

					if ( this.morphTargetsRelative ) {

						_vector.addVectors( this.boundingBox.min, _box.min );
						this.boundingBox.expandByPoint( _vector );

						_vector.addVectors( this.boundingBox.max, _box.max );
						this.boundingBox.expandByPoint( _vector );

					} else {

						this.boundingBox.expandByPoint( _box.min );
						this.boundingBox.expandByPoint( _box.max );

					}

				}

			}

		} else {

			this.boundingBox.makeEmpty();

		}

		if ( isNaN( this.boundingBox.min.x ) || isNaN( this.boundingBox.min.y ) || isNaN( this.boundingBox.min.z ) ) {

			console.error( 'THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this );

		}

	}

	computeBoundingSphere() {

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		const position = this.attributes.position;
		const morphAttributesPosition = this.morphAttributes.position;

		if ( position && position.isGLBufferAttribute ) {

			console.error( 'THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".', this );

			this.boundingSphere.set( new Vector3(), Infinity );

			return;

		}

		if ( position ) {

			// first, find the center of the bounding sphere

			const center = this.boundingSphere.center;

			_box.setFromBufferAttribute( position );

			// process morph attributes if present

			if ( morphAttributesPosition ) {

				for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

					const morphAttribute = morphAttributesPosition[ i ];
					_boxMorphTargets.setFromBufferAttribute( morphAttribute );

					if ( this.morphTargetsRelative ) {

						_vector.addVectors( _box.min, _boxMorphTargets.min );
						_box.expandByPoint( _vector );

						_vector.addVectors( _box.max, _boxMorphTargets.max );
						_box.expandByPoint( _vector );

					} else {

						_box.expandByPoint( _boxMorphTargets.min );
						_box.expandByPoint( _boxMorphTargets.max );

					}

				}

			}

			_box.getCenter( center );

			// second, try to find a boundingSphere with a radius smaller than the
			// boundingSphere of the boundingBox: sqrt(3) smaller in the best case

			let maxRadiusSq = 0;

			for ( let i = 0, il = position.count; i < il; i ++ ) {

				_vector.fromBufferAttribute( position, i );

				maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector ) );

			}

			// process morph attributes if present

			if ( morphAttributesPosition ) {

				for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

					const morphAttribute = morphAttributesPosition[ i ];
					const morphTargetsRelative = this.morphTargetsRelative;

					for ( let j = 0, jl = morphAttribute.count; j < jl; j ++ ) {

						_vector.fromBufferAttribute( morphAttribute, j );

						if ( morphTargetsRelative ) {

							_offset.fromBufferAttribute( position, j );
							_vector.add( _offset );

						}

						maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector ) );

					}

				}

			}

			this.boundingSphere.radius = Math.sqrt( maxRadiusSq );

			if ( isNaN( this.boundingSphere.radius ) ) {

				console.error( 'THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this );

			}

		}

	}

	computeTangents() {

		const index = this.index;
		const attributes = this.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if ( index === null ||
			 attributes.position === undefined ||
			 attributes.normal === undefined ||
			 attributes.uv === undefined ) {

			console.error( 'THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)' );
			return;

		}

		const indices = index.array;
		const positions = attributes.position.array;
		const normals = attributes.normal.array;
		const uvs = attributes.uv.array;

		const nVertices = positions.length / 3;

		if ( this.hasAttribute( 'tangent' ) === false ) {

			this.setAttribute( 'tangent', new BufferAttribute( new Float32Array( 4 * nVertices ), 4 ) );

		}

		const tangents = this.getAttribute( 'tangent' ).array;

		const tan1 = [], tan2 = [];

		for ( let i = 0; i < nVertices; i ++ ) {

			tan1[ i ] = new Vector3();
			tan2[ i ] = new Vector3();

		}

		const vA = new Vector3(),
			vB = new Vector3(),
			vC = new Vector3(),

			uvA = new Vector2(),
			uvB = new Vector2(),
			uvC = new Vector2(),

			sdir = new Vector3(),
			tdir = new Vector3();

		function handleTriangle( a, b, c ) {

			vA.fromArray( positions, a * 3 );
			vB.fromArray( positions, b * 3 );
			vC.fromArray( positions, c * 3 );

			uvA.fromArray( uvs, a * 2 );
			uvB.fromArray( uvs, b * 2 );
			uvC.fromArray( uvs, c * 2 );

			vB.sub( vA );
			vC.sub( vA );

			uvB.sub( uvA );
			uvC.sub( uvA );

			const r = 1.0 / ( uvB.x * uvC.y - uvC.x * uvB.y );

			// silently ignore degenerate uv triangles having coincident or colinear vertices

			if ( ! isFinite( r ) ) return;

			sdir.copy( vB ).multiplyScalar( uvC.y ).addScaledVector( vC, - uvB.y ).multiplyScalar( r );
			tdir.copy( vC ).multiplyScalar( uvB.x ).addScaledVector( vB, - uvC.x ).multiplyScalar( r );

			tan1[ a ].add( sdir );
			tan1[ b ].add( sdir );
			tan1[ c ].add( sdir );

			tan2[ a ].add( tdir );
			tan2[ b ].add( tdir );
			tan2[ c ].add( tdir );

		}

		let groups = this.groups;

		if ( groups.length === 0 ) {

			groups = [ {
				start: 0,
				count: indices.length
			} ];

		}

		for ( let i = 0, il = groups.length; i < il; ++ i ) {

			const group = groups[ i ];

			const start = group.start;
			const count = group.count;

			for ( let j = start, jl = start + count; j < jl; j += 3 ) {

				handleTriangle(
					indices[ j + 0 ],
					indices[ j + 1 ],
					indices[ j + 2 ]
				);

			}

		}

		const tmp = new Vector3(), tmp2 = new Vector3();
		const n = new Vector3(), n2 = new Vector3();

		function handleVertex( v ) {

			n.fromArray( normals, v * 3 );
			n2.copy( n );

			const t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			tmp.copy( t );
			tmp.sub( n.multiplyScalar( n.dot( t ) ) ).normalize();

			// Calculate handedness

			tmp2.crossVectors( n2, t );
			const test = tmp2.dot( tan2[ v ] );
			const w = ( test < 0.0 ) ? - 1.0 : 1.0;

			tangents[ v * 4 ] = tmp.x;
			tangents[ v * 4 + 1 ] = tmp.y;
			tangents[ v * 4 + 2 ] = tmp.z;
			tangents[ v * 4 + 3 ] = w;

		}

		for ( let i = 0, il = groups.length; i < il; ++ i ) {

			const group = groups[ i ];

			const start = group.start;
			const count = group.count;

			for ( let j = start, jl = start + count; j < jl; j += 3 ) {

				handleVertex( indices[ j + 0 ] );
				handleVertex( indices[ j + 1 ] );
				handleVertex( indices[ j + 2 ] );

			}

		}

	}

	computeVertexNormals() {

		const index = this.index;
		const positionAttribute = this.getAttribute( 'position' );

		if ( positionAttribute !== undefined ) {

			let normalAttribute = this.getAttribute( 'normal' );

			if ( normalAttribute === undefined ) {

				normalAttribute = new BufferAttribute( new Float32Array( positionAttribute.count * 3 ), 3 );
				this.setAttribute( 'normal', normalAttribute );

			} else {

				// reset existing normals to zero

				for ( let i = 0, il = normalAttribute.count; i < il; i ++ ) {

					normalAttribute.setXYZ( i, 0, 0, 0 );

				}

			}

			const pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
			const nA = new Vector3(), nB = new Vector3(), nC = new Vector3();
			const cb = new Vector3(), ab = new Vector3();

			// indexed elements

			if ( index ) {

				for ( let i = 0, il = index.count; i < il; i += 3 ) {

					const vA = index.getX( i + 0 );
					const vB = index.getX( i + 1 );
					const vC = index.getX( i + 2 );

					pA.fromBufferAttribute( positionAttribute, vA );
					pB.fromBufferAttribute( positionAttribute, vB );
					pC.fromBufferAttribute( positionAttribute, vC );

					cb.subVectors( pC, pB );
					ab.subVectors( pA, pB );
					cb.cross( ab );

					nA.fromBufferAttribute( normalAttribute, vA );
					nB.fromBufferAttribute( normalAttribute, vB );
					nC.fromBufferAttribute( normalAttribute, vC );

					nA.add( cb );
					nB.add( cb );
					nC.add( cb );

					normalAttribute.setXYZ( vA, nA.x, nA.y, nA.z );
					normalAttribute.setXYZ( vB, nB.x, nB.y, nB.z );
					normalAttribute.setXYZ( vC, nC.x, nC.y, nC.z );

				}

			} else {

				// non-indexed elements (unconnected triangle soup)

				for ( let i = 0, il = positionAttribute.count; i < il; i += 3 ) {

					pA.fromBufferAttribute( positionAttribute, i + 0 );
					pB.fromBufferAttribute( positionAttribute, i + 1 );
					pC.fromBufferAttribute( positionAttribute, i + 2 );

					cb.subVectors( pC, pB );
					ab.subVectors( pA, pB );
					cb.cross( ab );

					normalAttribute.setXYZ( i + 0, cb.x, cb.y, cb.z );
					normalAttribute.setXYZ( i + 1, cb.x, cb.y, cb.z );
					normalAttribute.setXYZ( i + 2, cb.x, cb.y, cb.z );

				}

			}

			this.normalizeNormals();

			normalAttribute.needsUpdate = true;

		}

	}

	normalizeNormals() {

		const normals = this.attributes.normal;

		for ( let i = 0, il = normals.count; i < il; i ++ ) {

			_vector.fromBufferAttribute( normals, i );

			_vector.normalize();

			normals.setXYZ( i, _vector.x, _vector.y, _vector.z );

		}

	}

	toNonIndexed() {

		function convertBufferAttribute( attribute, indices ) {

			const array = attribute.array;
			const itemSize = attribute.itemSize;
			const normalized = attribute.normalized;

			const array2 = new array.constructor( indices.length * itemSize );

			let index = 0, index2 = 0;

			for ( let i = 0, l = indices.length; i < l; i ++ ) {

				if ( attribute.isInterleavedBufferAttribute ) {

					index = indices[ i ] * attribute.data.stride + attribute.offset;

				} else {

					index = indices[ i ] * itemSize;

				}

				for ( let j = 0; j < itemSize; j ++ ) {

					array2[ index2 ++ ] = array[ index ++ ];

				}

			}

			return new BufferAttribute( array2, itemSize, normalized );

		}

		//

		if ( this.index === null ) {

			console.warn( 'THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.' );
			return this;

		}

		const geometry2 = new BufferGeometry();

		const indices = this.index.array;
		const attributes = this.attributes;

		// attributes

		for ( const name in attributes ) {

			const attribute = attributes[ name ];

			const newAttribute = convertBufferAttribute( attribute, indices );

			geometry2.setAttribute( name, newAttribute );

		}

		// morph attributes

		const morphAttributes = this.morphAttributes;

		for ( const name in morphAttributes ) {

			const morphArray = [];
			const morphAttribute = morphAttributes[ name ]; // morphAttribute: array of Float32BufferAttributes

			for ( let i = 0, il = morphAttribute.length; i < il; i ++ ) {

				const attribute = morphAttribute[ i ];

				const newAttribute = convertBufferAttribute( attribute, indices );

				morphArray.push( newAttribute );

			}

			geometry2.morphAttributes[ name ] = morphArray;

		}

		geometry2.morphTargetsRelative = this.morphTargetsRelative;

		// groups

		const groups = this.groups;

		for ( let i = 0, l = groups.length; i < l; i ++ ) {

			const group = groups[ i ];
			geometry2.addGroup( group.start, group.count, group.materialIndex );

		}

		return geometry2;

	}

	toJSON() {

		const data = {
			metadata: {
				version: 4.6,
				type: 'BufferGeometry',
				generator: 'BufferGeometry.toJSON'
			}
		};

		// standard BufferGeometry serialization

		data.uuid = this.uuid;
		data.type = this.type;
		if ( this.name !== '' ) data.name = this.name;
		if ( Object.keys( this.userData ).length > 0 ) data.userData = this.userData;

		if ( this.parameters !== undefined ) {

			const parameters = this.parameters;

			for ( const key in parameters ) {

				if ( parameters[ key ] !== undefined ) data[ key ] = parameters[ key ];

			}

			return data;

		}

		// for simplicity the code assumes attributes are not shared across geometries, see #15811

		data.data = { attributes: {} };

		const index = this.index;

		if ( index !== null ) {

			data.data.index = {
				type: index.array.constructor.name,
				array: Array.prototype.slice.call( index.array )
			};

		}

		const attributes = this.attributes;

		for ( const key in attributes ) {

			const attribute = attributes[ key ];

			data.data.attributes[ key ] = attribute.toJSON( data.data );

		}

		const morphAttributes = {};
		let hasMorphAttributes = false;

		for ( const key in this.morphAttributes ) {

			const attributeArray = this.morphAttributes[ key ];

			const array = [];

			for ( let i = 0, il = attributeArray.length; i < il; i ++ ) {

				const attribute = attributeArray[ i ];

				array.push( attribute.toJSON( data.data ) );

			}

			if ( array.length > 0 ) {

				morphAttributes[ key ] = array;

				hasMorphAttributes = true;

			}

		}

		if ( hasMorphAttributes ) {

			data.data.morphAttributes = morphAttributes;
			data.data.morphTargetsRelative = this.morphTargetsRelative;

		}

		const groups = this.groups;

		if ( groups.length > 0 ) {

			data.data.groups = JSON.parse( JSON.stringify( groups ) );

		}

		const boundingSphere = this.boundingSphere;

		if ( boundingSphere !== null ) {

			data.data.boundingSphere = {
				center: boundingSphere.center.toArray(),
				radius: boundingSphere.radius
			};

		}

		return data;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( source ) {

		// reset

		this.index = null;
		this.attributes = {};
		this.morphAttributes = {};
		this.groups = [];
		this.boundingBox = null;
		this.boundingSphere = null;

		// used for storing cloned, shared data

		const data = {};

		// name

		this.name = source.name;

		// index

		const index = source.index;

		if ( index !== null ) {

			this.setIndex( index.clone( data ) );

		}

		// attributes

		const attributes = source.attributes;

		for ( const name in attributes ) {

			const attribute = attributes[ name ];
			this.setAttribute( name, attribute.clone( data ) );

		}

		// morph attributes

		const morphAttributes = source.morphAttributes;

		for ( const name in morphAttributes ) {

			const array = [];
			const morphAttribute = morphAttributes[ name ]; // morphAttribute: array of Float32BufferAttributes

			for ( let i = 0, l = morphAttribute.length; i < l; i ++ ) {

				array.push( morphAttribute[ i ].clone( data ) );

			}

			this.morphAttributes[ name ] = array;

		}

		this.morphTargetsRelative = source.morphTargetsRelative;

		// groups

		const groups = source.groups;

		for ( let i = 0, l = groups.length; i < l; i ++ ) {

			const group = groups[ i ];
			this.addGroup( group.start, group.count, group.materialIndex );

		}

		// bounding box

		const boundingBox = source.boundingBox;

		if ( boundingBox !== null ) {

			this.boundingBox = boundingBox.clone();

		}

		// bounding sphere

		const boundingSphere = source.boundingSphere;

		if ( boundingSphere !== null ) {

			this.boundingSphere = boundingSphere.clone();

		}

		// draw range

		this.drawRange.start = source.drawRange.start;
		this.drawRange.count = source.drawRange.count;

		// user data

		this.userData = source.userData;

		return this;

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

function SRGBToLinear( c ) {

	return ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );

}

function LinearToSRGB( c ) {

	return ( c < 0.0031308 ) ? c * 12.92 : 1.055 * ( Math.pow( c, 0.41666 ) ) - 0.055;

}

/**
 * Matrices converting P3 <-> Rec. 709 primaries, without gamut mapping
 * or clipping. Based on W3C specifications for sRGB and Display P3,
 * and ICC specifications for the D50 connection space. Values in/out
 * are _linear_ sRGB and _linear_ Display P3.
 *
 * Note that both sRGB and Display P3 use the sRGB transfer functions.
 *
 * Reference:
 * - http://www.russellcottrell.com/photo/matrixCalculator.htm
 */

const LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = /*@__PURE__*/ new Matrix3().fromArray( [
	0.8224621, 0.0331941, 0.0170827,
	0.1775380, 0.9668058, 0.0723974,
	- 0.0000001, 0.0000001, 0.9105199
] );

const LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = /*@__PURE__*/ new Matrix3().fromArray( [
	1.2249401, - 0.0420569, - 0.0196376,
	- 0.2249404, 1.0420571, - 0.0786361,
	0.0000001, 0.0000000, 1.0982735
] );

function DisplayP3ToLinearSRGB( color ) {

	// Display P3 uses the sRGB transfer functions
	return color.convertSRGBToLinear().applyMatrix3( LINEAR_DISPLAY_P3_TO_LINEAR_SRGB );

}

function LinearSRGBToDisplayP3( color ) {

	// Display P3 uses the sRGB transfer functions
	return color.applyMatrix3( LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 ).convertLinearToSRGB();

}

// Conversions from <source> to Linear-sRGB reference space.
const TO_LINEAR = {
	[ LinearSRGBColorSpace ]: ( color ) => color,
	[ SRGBColorSpace ]: ( color ) => color.convertSRGBToLinear(),
	[ DisplayP3ColorSpace ]: DisplayP3ToLinearSRGB,
};

// Conversions to <target> from Linear-sRGB reference space.
const FROM_LINEAR = {
	[ LinearSRGBColorSpace ]: ( color ) => color,
	[ SRGBColorSpace ]: ( color ) => color.convertLinearToSRGB(),
	[ DisplayP3ColorSpace ]: LinearSRGBToDisplayP3,
};

const ColorManagement = {

	enabled: true,

	get legacyMode() {

		console.warn( 'THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150.' );

		return ! this.enabled;

	},

	set legacyMode( legacyMode ) {

		console.warn( 'THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150.' );

		this.enabled = ! legacyMode;

	},

	get workingColorSpace() {

		return LinearSRGBColorSpace;

	},

	set workingColorSpace( colorSpace ) {

		console.warn( 'THREE.ColorManagement: .workingColorSpace is readonly.' );

	},

	convert: function ( color, sourceColorSpace, targetColorSpace ) {

		if ( this.enabled === false || sourceColorSpace === targetColorSpace || ! sourceColorSpace || ! targetColorSpace ) {

			return color;

		}

		const sourceToLinear = TO_LINEAR[ sourceColorSpace ];
		const targetFromLinear = FROM_LINEAR[ targetColorSpace ];

		if ( sourceToLinear === undefined || targetFromLinear === undefined ) {

			throw new Error( `Unsupported color space conversion, "${ sourceColorSpace }" to "${ targetColorSpace }".` );

		}

		return targetFromLinear( sourceToLinear( color ) );

	},

	fromWorkingColorSpace: function ( color, targetColorSpace ) {

		return this.convert( color, this.workingColorSpace, targetColorSpace );

	},

	toWorkingColorSpace: function ( color, sourceColorSpace ) {

		return this.convert( color, sourceColorSpace, this.workingColorSpace );

	},

};

const _colorKeywords = { 'aliceblue': 0xF0F8FF, 'antiquewhite': 0xFAEBD7, 'aqua': 0x00FFFF, 'aquamarine': 0x7FFFD4, 'azure': 0xF0FFFF,
	'beige': 0xF5F5DC, 'bisque': 0xFFE4C4, 'black': 0x000000, 'blanchedalmond': 0xFFEBCD, 'blue': 0x0000FF, 'blueviolet': 0x8A2BE2,
	'brown': 0xA52A2A, 'burlywood': 0xDEB887, 'cadetblue': 0x5F9EA0, 'chartreuse': 0x7FFF00, 'chocolate': 0xD2691E, 'coral': 0xFF7F50,
	'cornflowerblue': 0x6495ED, 'cornsilk': 0xFFF8DC, 'crimson': 0xDC143C, 'cyan': 0x00FFFF, 'darkblue': 0x00008B, 'darkcyan': 0x008B8B,
	'darkgoldenrod': 0xB8860B, 'darkgray': 0xA9A9A9, 'darkgreen': 0x006400, 'darkgrey': 0xA9A9A9, 'darkkhaki': 0xBDB76B, 'darkmagenta': 0x8B008B,
	'darkolivegreen': 0x556B2F, 'darkorange': 0xFF8C00, 'darkorchid': 0x9932CC, 'darkred': 0x8B0000, 'darksalmon': 0xE9967A, 'darkseagreen': 0x8FBC8F,
	'darkslateblue': 0x483D8B, 'darkslategray': 0x2F4F4F, 'darkslategrey': 0x2F4F4F, 'darkturquoise': 0x00CED1, 'darkviolet': 0x9400D3,
	'deeppink': 0xFF1493, 'deepskyblue': 0x00BFFF, 'dimgray': 0x696969, 'dimgrey': 0x696969, 'dodgerblue': 0x1E90FF, 'firebrick': 0xB22222,
	'floralwhite': 0xFFFAF0, 'forestgreen': 0x228B22, 'fuchsia': 0xFF00FF, 'gainsboro': 0xDCDCDC, 'ghostwhite': 0xF8F8FF, 'gold': 0xFFD700,
	'goldenrod': 0xDAA520, 'gray': 0x808080, 'green': 0x008000, 'greenyellow': 0xADFF2F, 'grey': 0x808080, 'honeydew': 0xF0FFF0, 'hotpink': 0xFF69B4,
	'indianred': 0xCD5C5C, 'indigo': 0x4B0082, 'ivory': 0xFFFFF0, 'khaki': 0xF0E68C, 'lavender': 0xE6E6FA, 'lavenderblush': 0xFFF0F5, 'lawngreen': 0x7CFC00,
	'lemonchiffon': 0xFFFACD, 'lightblue': 0xADD8E6, 'lightcoral': 0xF08080, 'lightcyan': 0xE0FFFF, 'lightgoldenrodyellow': 0xFAFAD2, 'lightgray': 0xD3D3D3,
	'lightgreen': 0x90EE90, 'lightgrey': 0xD3D3D3, 'lightpink': 0xFFB6C1, 'lightsalmon': 0xFFA07A, 'lightseagreen': 0x20B2AA, 'lightskyblue': 0x87CEFA,
	'lightslategray': 0x778899, 'lightslategrey': 0x778899, 'lightsteelblue': 0xB0C4DE, 'lightyellow': 0xFFFFE0, 'lime': 0x00FF00, 'limegreen': 0x32CD32,
	'linen': 0xFAF0E6, 'magenta': 0xFF00FF, 'maroon': 0x800000, 'mediumaquamarine': 0x66CDAA, 'mediumblue': 0x0000CD, 'mediumorchid': 0xBA55D3,
	'mediumpurple': 0x9370DB, 'mediumseagreen': 0x3CB371, 'mediumslateblue': 0x7B68EE, 'mediumspringgreen': 0x00FA9A, 'mediumturquoise': 0x48D1CC,
	'mediumvioletred': 0xC71585, 'midnightblue': 0x191970, 'mintcream': 0xF5FFFA, 'mistyrose': 0xFFE4E1, 'moccasin': 0xFFE4B5, 'navajowhite': 0xFFDEAD,
	'navy': 0x000080, 'oldlace': 0xFDF5E6, 'olive': 0x808000, 'olivedrab': 0x6B8E23, 'orange': 0xFFA500, 'orangered': 0xFF4500, 'orchid': 0xDA70D6,
	'palegoldenrod': 0xEEE8AA, 'palegreen': 0x98FB98, 'paleturquoise': 0xAFEEEE, 'palevioletred': 0xDB7093, 'papayawhip': 0xFFEFD5, 'peachpuff': 0xFFDAB9,
	'peru': 0xCD853F, 'pink': 0xFFC0CB, 'plum': 0xDDA0DD, 'powderblue': 0xB0E0E6, 'purple': 0x800080, 'rebeccapurple': 0x663399, 'red': 0xFF0000, 'rosybrown': 0xBC8F8F,
	'royalblue': 0x4169E1, 'saddlebrown': 0x8B4513, 'salmon': 0xFA8072, 'sandybrown': 0xF4A460, 'seagreen': 0x2E8B57, 'seashell': 0xFFF5EE,
	'sienna': 0xA0522D, 'silver': 0xC0C0C0, 'skyblue': 0x87CEEB, 'slateblue': 0x6A5ACD, 'slategray': 0x708090, 'slategrey': 0x708090, 'snow': 0xFFFAFA,
	'springgreen': 0x00FF7F, 'steelblue': 0x4682B4, 'tan': 0xD2B48C, 'teal': 0x008080, 'thistle': 0xD8BFD8, 'tomato': 0xFF6347, 'turquoise': 0x40E0D0,
	'violet': 0xEE82EE, 'wheat': 0xF5DEB3, 'white': 0xFFFFFF, 'whitesmoke': 0xF5F5F5, 'yellow': 0xFFFF00, 'yellowgreen': 0x9ACD32 };

const _hslA = { h: 0, s: 0, l: 0 };
const _hslB = { h: 0, s: 0, l: 0 };

function hue2rgb( p, q, t ) {

	if ( t < 0 ) t += 1;
	if ( t > 1 ) t -= 1;
	if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
	if ( t < 1 / 2 ) return q;
	if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
	return p;

}

class Color {

	constructor( r, g, b ) {

		this.isColor = true;

		this.r = 1;
		this.g = 1;
		this.b = 1;

		return this.set( r, g, b );

	}

	set( r, g, b ) {

		if ( g === undefined && b === undefined ) {

			// r is THREE.Color, hex or string

			const value = r;

			if ( value && value.isColor ) {

				this.copy( value );

			} else if ( typeof value === 'number' ) {

				this.setHex( value );

			} else if ( typeof value === 'string' ) {

				this.setStyle( value );

			}

		} else {

			this.setRGB( r, g, b );

		}

		return this;

	}

	setScalar( scalar ) {

		this.r = scalar;
		this.g = scalar;
		this.b = scalar;

		return this;

	}

	setHex( hex, colorSpace = SRGBColorSpace ) {

		hex = Math.floor( hex );

		this.r = ( hex >> 16 & 255 ) / 255;
		this.g = ( hex >> 8 & 255 ) / 255;
		this.b = ( hex & 255 ) / 255;

		ColorManagement.toWorkingColorSpace( this, colorSpace );

		return this;

	}

	setRGB( r, g, b, colorSpace = ColorManagement.workingColorSpace ) {

		this.r = r;
		this.g = g;
		this.b = b;

		ColorManagement.toWorkingColorSpace( this, colorSpace );

		return this;

	}

	setHSL( h, s, l, colorSpace = ColorManagement.workingColorSpace ) {

		// h,s,l ranges are in 0.0 - 1.0
		h = euclideanModulo( h, 1 );
		s = clamp( s, 0, 1 );
		l = clamp( l, 0, 1 );

		if ( s === 0 ) {

			this.r = this.g = this.b = l;

		} else {

			const p = l <= 0.5 ? l * ( 1 + s ) : l + s - ( l * s );
			const q = ( 2 * l ) - p;

			this.r = hue2rgb( q, p, h + 1 / 3 );
			this.g = hue2rgb( q, p, h );
			this.b = hue2rgb( q, p, h - 1 / 3 );

		}

		ColorManagement.toWorkingColorSpace( this, colorSpace );

		return this;

	}

	setStyle( style, colorSpace = SRGBColorSpace ) {

		function handleAlpha( string ) {

			if ( string === undefined ) return;

			if ( parseFloat( string ) < 1 ) {

				console.warn( 'THREE.Color: Alpha component of ' + style + ' will be ignored.' );

			}

		}


		let m;

		if ( m = /^(\w+)\(([^\)]*)\)/.exec( style ) ) {

			// rgb / hsl

			let color;
			const name = m[ 1 ];
			const components = m[ 2 ];

			switch ( name ) {

				case 'rgb':
				case 'rgba':

					if ( color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec( components ) ) {

						// rgb(255,0,0) rgba(255,0,0,0.5)

						handleAlpha( color[ 4 ] );

						return this.setRGB(
							Math.min( 255, parseInt( color[ 1 ], 10 ) ) / 255,
							Math.min( 255, parseInt( color[ 2 ], 10 ) ) / 255,
							Math.min( 255, parseInt( color[ 3 ], 10 ) ) / 255,
							colorSpace
						);

					}

					if ( color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec( components ) ) {

						// rgb(100%,0%,0%) rgba(100%,0%,0%,0.5)

						handleAlpha( color[ 4 ] );

						return this.setRGB(
							Math.min( 100, parseInt( color[ 1 ], 10 ) ) / 100,
							Math.min( 100, parseInt( color[ 2 ], 10 ) ) / 100,
							Math.min( 100, parseInt( color[ 3 ], 10 ) ) / 100,
							colorSpace
						);

					}

					break;

				case 'hsl':
				case 'hsla':

					if ( color = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec( components ) ) {

						// hsl(120,50%,50%) hsla(120,50%,50%,0.5)

						handleAlpha( color[ 4 ] );

						return this.setHSL(
							parseFloat( color[ 1 ] ) / 360,
							parseFloat( color[ 2 ] ) / 100,
							parseFloat( color[ 3 ] ) / 100,
							colorSpace
						);

					}

					break;

				default:

					console.warn( 'THREE.Color: Unknown color model ' + style );

			}

		} else if ( m = /^\#([A-Fa-f\d]+)$/.exec( style ) ) {

			// hex color

			const hex = m[ 1 ];
			const size = hex.length;

			if ( size === 3 ) {

				// #ff0
				return this.setRGB(
					parseInt( hex.charAt( 0 ), 16 ) / 15,
					parseInt( hex.charAt( 1 ), 16 ) / 15,
					parseInt( hex.charAt( 2 ), 16 ) / 15,
					colorSpace
				);

			} else if ( size === 6 ) {

				// #ff0000
				return this.setHex( parseInt( hex, 16 ), colorSpace );

			} else {

				console.warn( 'THREE.Color: Invalid hex color ' + style );

			}

		} else if ( style && style.length > 0 ) {

			return this.setColorName( style, colorSpace );

		}

		return this;

	}

	setColorName( style, colorSpace = SRGBColorSpace ) {

		// color keywords
		const hex = _colorKeywords[ style.toLowerCase() ];

		if ( hex !== undefined ) {

			// red
			this.setHex( hex, colorSpace );

		} else {

			// unknown color
			console.warn( 'THREE.Color: Unknown color ' + style );

		}

		return this;

	}

	clone() {

		return new this.constructor( this.r, this.g, this.b );

	}

	copy( color ) {

		this.r = color.r;
		this.g = color.g;
		this.b = color.b;

		return this;

	}

	copySRGBToLinear( color ) {

		this.r = SRGBToLinear( color.r );
		this.g = SRGBToLinear( color.g );
		this.b = SRGBToLinear( color.b );

		return this;

	}

	copyLinearToSRGB( color ) {

		this.r = LinearToSRGB( color.r );
		this.g = LinearToSRGB( color.g );
		this.b = LinearToSRGB( color.b );

		return this;

	}

	convertSRGBToLinear() {

		this.copySRGBToLinear( this );

		return this;

	}

	convertLinearToSRGB() {

		this.copyLinearToSRGB( this );

		return this;

	}

	getHex( colorSpace = SRGBColorSpace ) {

		ColorManagement.fromWorkingColorSpace( _color.copy( this ), colorSpace );

		return Math.round( clamp( _color.r * 255, 0, 255 ) ) * 65536 + Math.round( clamp( _color.g * 255, 0, 255 ) ) * 256 + Math.round( clamp( _color.b * 255, 0, 255 ) );

	}

	getHexString( colorSpace = SRGBColorSpace ) {

		return ( '000000' + this.getHex( colorSpace ).toString( 16 ) ).slice( - 6 );

	}

	getHSL( target, colorSpace = ColorManagement.workingColorSpace ) {

		// h,s,l ranges are in 0.0 - 1.0

		ColorManagement.fromWorkingColorSpace( _color.copy( this ), colorSpace );

		const r = _color.r, g = _color.g, b = _color.b;

		const max = Math.max( r, g, b );
		const min = Math.min( r, g, b );

		let hue, saturation;
		const lightness = ( min + max ) / 2.0;

		if ( min === max ) {

			hue = 0;
			saturation = 0;

		} else {

			const delta = max - min;

			saturation = lightness <= 0.5 ? delta / ( max + min ) : delta / ( 2 - max - min );

			switch ( max ) {

				case r: hue = ( g - b ) / delta + ( g < b ? 6 : 0 ); break;
				case g: hue = ( b - r ) / delta + 2; break;
				case b: hue = ( r - g ) / delta + 4; break;

			}

			hue /= 6;

		}

		target.h = hue;
		target.s = saturation;
		target.l = lightness;

		return target;

	}

	getRGB( target, colorSpace = ColorManagement.workingColorSpace ) {

		ColorManagement.fromWorkingColorSpace( _color.copy( this ), colorSpace );

		target.r = _color.r;
		target.g = _color.g;
		target.b = _color.b;

		return target;

	}

	getStyle( colorSpace = SRGBColorSpace ) {

		ColorManagement.fromWorkingColorSpace( _color.copy( this ), colorSpace );

		const r = _color.r, g = _color.g, b = _color.b;

		if ( colorSpace !== SRGBColorSpace ) {

			// Requires CSS Color Module Level 4 (https://www.w3.org/TR/css-color-4/).
			return `color(${ colorSpace } ${ r.toFixed( 3 ) } ${ g.toFixed( 3 ) } ${ b.toFixed( 3 ) })`;

		}

		return `rgb(${ Math.round( r * 255 ) },${ Math.round( g * 255 ) },${ Math.round( b * 255 ) })`;

	}

	offsetHSL( h, s, l ) {

		this.getHSL( _hslA );

		_hslA.h += h; _hslA.s += s; _hslA.l += l;

		this.setHSL( _hslA.h, _hslA.s, _hslA.l );

		return this;

	}

	add( color ) {

		this.r += color.r;
		this.g += color.g;
		this.b += color.b;

		return this;

	}

	addColors( color1, color2 ) {

		this.r = color1.r + color2.r;
		this.g = color1.g + color2.g;
		this.b = color1.b + color2.b;

		return this;

	}

	addScalar( s ) {

		this.r += s;
		this.g += s;
		this.b += s;

		return this;

	}

	sub( color ) {

		this.r = Math.max( 0, this.r - color.r );
		this.g = Math.max( 0, this.g - color.g );
		this.b = Math.max( 0, this.b - color.b );

		return this;

	}

	multiply( color ) {

		this.r *= color.r;
		this.g *= color.g;
		this.b *= color.b;

		return this;

	}

	multiplyScalar( s ) {

		this.r *= s;
		this.g *= s;
		this.b *= s;

		return this;

	}

	lerp( color, alpha ) {

		this.r += ( color.r - this.r ) * alpha;
		this.g += ( color.g - this.g ) * alpha;
		this.b += ( color.b - this.b ) * alpha;

		return this;

	}

	lerpColors( color1, color2, alpha ) {

		this.r = color1.r + ( color2.r - color1.r ) * alpha;
		this.g = color1.g + ( color2.g - color1.g ) * alpha;
		this.b = color1.b + ( color2.b - color1.b ) * alpha;

		return this;

	}

	lerpHSL( color, alpha ) {

		this.getHSL( _hslA );
		color.getHSL( _hslB );

		const h = lerp( _hslA.h, _hslB.h, alpha );
		const s = lerp( _hslA.s, _hslB.s, alpha );
		const l = lerp( _hslA.l, _hslB.l, alpha );

		this.setHSL( h, s, l );

		return this;

	}

	setFromVector3( v ) {

		this.r = v.x;
		this.g = v.y;
		this.b = v.z;

		return this;

	}

	applyMatrix3( m ) {

		const r = this.r, g = this.g, b = this.b;
		const e = m.elements;

		this.r = e[ 0 ] * r + e[ 3 ] * g + e[ 6 ] * b;
		this.g = e[ 1 ] * r + e[ 4 ] * g + e[ 7 ] * b;
		this.b = e[ 2 ] * r + e[ 5 ] * g + e[ 8 ] * b;

		return this;

	}

	equals( c ) {

		return ( c.r === this.r ) && ( c.g === this.g ) && ( c.b === this.b );

	}

	fromArray( array, offset = 0 ) {

		this.r = array[ offset ];
		this.g = array[ offset + 1 ];
		this.b = array[ offset + 2 ];

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.r;
		array[ offset + 1 ] = this.g;
		array[ offset + 2 ] = this.b;

		return array;

	}

	fromBufferAttribute( attribute, index ) {

		this.r = attribute.getX( index );
		this.g = attribute.getY( index );
		this.b = attribute.getZ( index );

		return this;

	}

	toJSON() {

		return this.getHex();

	}

	*[ Symbol.iterator ]() {

		yield this.r;
		yield this.g;
		yield this.b;

	}

}

const _color = /*@__PURE__*/ new Color();

Color.NAMES = _colorKeywords;

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

const _taskCache = new WeakMap();

class DRACOLoader extends Loader {

	constructor( manager ) {

		super( manager );

		this.decoderPath = '';
		this.decoderConfig = {};
		this.decoderBinary = null;
		this.decoderPending = null;

		this.workerLimit = 4;
		this.workerPool = [];
		this.workerNextTaskID = 1;
		this.workerSourceURL = '';

		this.defaultAttributeIDs = {
			position: 'POSITION',
			normal: 'NORMAL',
			color: 'COLOR',
			uv: 'TEX_COORD'
		};
		this.defaultAttributeTypes = {
			position: 'Float32Array',
			normal: 'Float32Array',
			color: 'Float32Array',
			uv: 'Float32Array'
		};

	}

	setDecoderPath( path ) {

		this.decoderPath = path;

		return this;

	}

	setDecoderConfig( config ) {

		this.decoderConfig = config;

		return this;

	}

	setWorkerLimit( workerLimit ) {

		this.workerLimit = workerLimit;

		return this;

	}

	load( url, onLoad, onProgress, onError ) {

		const loader = new FileLoader( this.manager );

		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );

		loader.load( url, ( buffer ) => {

			this.parse( buffer, onLoad, onError );

		}, onProgress, onError );

	}

	parse( buffer, onLoad, onError ) {

		this.decodeDracoFile( buffer, onLoad, null, null, SRGBColorSpace ).catch( onError );

	}

	decodeDracoFile( buffer, callback, attributeIDs, attributeTypes, vertexColorSpace = LinearSRGBColorSpace ) {

		const taskConfig = {
			attributeIDs: attributeIDs || this.defaultAttributeIDs,
			attributeTypes: attributeTypes || this.defaultAttributeTypes,
			useUniqueIDs: !! attributeIDs,
			vertexColorSpace: vertexColorSpace,
		};

		return this.decodeGeometry( buffer, taskConfig ).then( callback );

	}

	decodeGeometry( buffer, taskConfig ) {

		const taskKey = JSON.stringify( taskConfig );

		// Check for an existing task using this buffer. A transferred buffer cannot be transferred
		// again from this thread.
		if ( _taskCache.has( buffer ) ) {

			const cachedTask = _taskCache.get( buffer );

			if ( cachedTask.key === taskKey ) {

				return cachedTask.promise;

			} else if ( buffer.byteLength === 0 ) {

				// Technically, it would be possible to wait for the previous task to complete,
				// transfer the buffer back, and decode again with the second configuration. That
				// is complex, and I don't know of any reason to decode a Draco buffer twice in
				// different ways, so this is left unimplemented.
				throw new Error(

					'THREE.DRACOLoader: Unable to re-decode a buffer with different ' +
					'settings. Buffer has already been transferred.'

				);

			}

		}

		//

		let worker;
		const taskID = this.workerNextTaskID ++;
		const taskCost = buffer.byteLength;

		// Obtain a worker and assign a task, and construct a geometry instance
		// when the task completes.
		const geometryPending = this._getWorker( taskID, taskCost )
			.then( ( _worker ) => {

				worker = _worker;

				return new Promise( ( resolve, reject ) => {

					worker._callbacks[ taskID ] = { resolve, reject };

					worker.postMessage( { type: 'decode', id: taskID, taskConfig, buffer }, [ buffer ] );

					// this.debug();

				} );

			} )
			.then( ( message ) => this._createGeometry( message.geometry ) );

		// Remove task from the task list.
		// Note: replaced '.finally()' with '.catch().then()' block - iOS 11 support (#19416)
		geometryPending
			.catch( () => true )
			.then( () => {

				if ( worker && taskID ) {

					this._releaseTask( worker, taskID );

					// this.debug();

				}

			} );

		// Cache the task result.
		_taskCache.set( buffer, {

			key: taskKey,
			promise: geometryPending

		} );

		return geometryPending;

	}

	_createGeometry( geometryData ) {

		const geometry = new BufferGeometry();

		if ( geometryData.index ) {

			geometry.setIndex( new BufferAttribute( geometryData.index.array, 1 ) );

		}

		for ( let i = 0; i < geometryData.attributes.length; i ++ ) {

			const result = geometryData.attributes[ i ];
			const name = result.name;
			const array = result.array;
			const itemSize = result.itemSize;

			const attribute = new BufferAttribute( array, itemSize );

			if ( name === 'color' ) {

				this._assignVertexColorSpace( attribute, result.vertexColorSpace );

				attribute.normalized = ( array instanceof Float32Array ) === false;

			}

			geometry.setAttribute( name, attribute );

		}

		return geometry;

	}

	_assignVertexColorSpace( attribute, inputColorSpace ) {

		// While .drc files do not specify colorspace, the only 'official' tooling
		// is PLY and OBJ converters, which use sRGB. We'll assume sRGB when a .drc
		// file is passed into .load() or .parse(). GLTFLoader uses internal APIs
		// to decode geometry, and vertex colors are already Linear-sRGB in there.

		if ( inputColorSpace !== SRGBColorSpace ) return;

		const _color = new Color();

		for ( let i = 0, il = attribute.count; i < il; i ++ ) {

			_color.fromBufferAttribute( attribute, i ).convertSRGBToLinear();
			attribute.setXYZ( i, _color.r, _color.g, _color.b );

		}

	}

	_loadLibrary( url, responseType ) {

		const loader = new FileLoader( this.manager );
		loader.setPath( this.decoderPath );
		loader.setResponseType( responseType );
		loader.setWithCredentials( this.withCredentials );

		return new Promise( ( resolve, reject ) => {

			loader.load( url, resolve, undefined, reject );

		} );

	}

	preload() {

		this._initDecoder();

		return this;

	}

	_initDecoder() {

		if ( this.decoderPending ) return this.decoderPending;

		const useJS = typeof WebAssembly !== 'object' || this.decoderConfig.type === 'js';
		const librariesPending = [];

		if ( useJS ) {

			librariesPending.push( this._loadLibrary( 'draco_decoder.js', 'text' ) );

		} else {

			librariesPending.push( this._loadLibrary( 'draco_wasm_wrapper.js', 'text' ) );
			librariesPending.push( this._loadLibrary( 'draco_decoder.wasm', 'arraybuffer' ) );

		}

		this.decoderPending = Promise.all( librariesPending )
			.then( ( libraries ) => {

				const jsContent = libraries[ 0 ];

				if ( ! useJS ) {

					this.decoderConfig.wasmBinary = libraries[ 1 ];

				}

				const fn = DRACOWorker.toString();

				const body = [
					'/* draco decoder */',
					jsContent,
					'',
					'/* worker */',
					fn.substring( fn.indexOf( '{' ) + 1, fn.lastIndexOf( '}' ) )
				].join( '\n' );

				this.workerSourceURL = URL.createObjectURL( new Blob( [ body ] ) );

			} );

		return this.decoderPending;

	}

	_getWorker( taskID, taskCost ) {

		return this._initDecoder().then( () => {

			if ( this.workerPool.length < this.workerLimit ) {

				const worker = new Worker( this.workerSourceURL );

				worker._callbacks = {};
				worker._taskCosts = {};
				worker._taskLoad = 0;

				worker.postMessage( { type: 'init', decoderConfig: this.decoderConfig } );

				worker.onmessage = function ( e ) {

					const message = e.data;

					switch ( message.type ) {

						case 'decode':
							worker._callbacks[ message.id ].resolve( message );
							break;

						case 'error':
							worker._callbacks[ message.id ].reject( message );
							break;

						default:
							console.error( 'THREE.DRACOLoader: Unexpected message, "' + message.type + '"' );

					}

				};

				this.workerPool.push( worker );

			} else {

				this.workerPool.sort( function ( a, b ) {

					return a._taskLoad > b._taskLoad ? - 1 : 1;

				} );

			}

			const worker = this.workerPool[ this.workerPool.length - 1 ];
			worker._taskCosts[ taskID ] = taskCost;
			worker._taskLoad += taskCost;
			return worker;

		} );

	}

	_releaseTask( worker, taskID ) {

		worker._taskLoad -= worker._taskCosts[ taskID ];
		delete worker._callbacks[ taskID ];
		delete worker._taskCosts[ taskID ];

	}

	debug() {

		console.log( 'Task load: ', this.workerPool.map( ( worker ) => worker._taskLoad ) );

	}

	dispose() {

		for ( let i = 0; i < this.workerPool.length; ++ i ) {

			this.workerPool[ i ].terminate();

		}

		this.workerPool.length = 0;

		if ( this.workerSourceURL !== '' ) {

			URL.revokeObjectURL( this.workerSourceURL );

		}

		return this;

	}

}

/* WEB WORKER */

function DRACOWorker() {

	let decoderConfig;
	let decoderPending;

	onmessage = function ( e ) {

		const message = e.data;

		switch ( message.type ) {

			case 'init':
				decoderConfig = message.decoderConfig;
				decoderPending = new Promise( function ( resolve/*, reject*/ ) {

					decoderConfig.onModuleLoaded = function ( draco ) {

						// Module is Promise-like. Wrap before resolving to avoid loop.
						resolve( { draco: draco } );

					};

					DracoDecoderModule( decoderConfig ); // eslint-disable-line no-undef

				} );
				break;

			case 'decode':
				const buffer = message.buffer;
				const taskConfig = message.taskConfig;
				decoderPending.then( ( module ) => {

					const draco = module.draco;
					const decoder = new draco.Decoder();

					try {

						const geometry = decodeGeometry( draco, decoder, new Int8Array( buffer ), taskConfig );

						const buffers = geometry.attributes.map( ( attr ) => attr.array.buffer );

						if ( geometry.index ) buffers.push( geometry.index.array.buffer );

						self.postMessage( { type: 'decode', id: message.id, geometry }, buffers );

					} catch ( error ) {

						console.error( error );

						self.postMessage( { type: 'error', id: message.id, error: error.message } );

					} finally {

						draco.destroy( decoder );

					}

				} );
				break;

		}

	};

	function decodeGeometry( draco, decoder, array, taskConfig ) {

		const attributeIDs = taskConfig.attributeIDs;
		const attributeTypes = taskConfig.attributeTypes;

		let dracoGeometry;
		let decodingStatus;

		const geometryType = decoder.GetEncodedGeometryType( array );

		if ( geometryType === draco.TRIANGULAR_MESH ) {

			dracoGeometry = new draco.Mesh();
			decodingStatus = decoder.DecodeArrayToMesh( array, array.byteLength, dracoGeometry );

		} else if ( geometryType === draco.POINT_CLOUD ) {

			dracoGeometry = new draco.PointCloud();
			decodingStatus = decoder.DecodeArrayToPointCloud( array, array.byteLength, dracoGeometry );

		} else {

			throw new Error( 'THREE.DRACOLoader: Unexpected geometry type.' );

		}

		if ( ! decodingStatus.ok() || dracoGeometry.ptr === 0 ) {

			throw new Error( 'THREE.DRACOLoader: Decoding failed: ' + decodingStatus.error_msg() );

		}

		const geometry = { index: null, attributes: [] };

		// Gather all vertex attributes.
		for ( const attributeName in attributeIDs ) {

			const attributeType = self[ attributeTypes[ attributeName ] ];

			let attribute;
			let attributeID;

			// A Draco file may be created with default vertex attributes, whose attribute IDs
			// are mapped 1:1 from their semantic name (POSITION, NORMAL, ...). Alternatively,
			// a Draco file may contain a custom set of attributes, identified by known unique
			// IDs. glTF files always do the latter, and `.drc` files typically do the former.
			if ( taskConfig.useUniqueIDs ) {

				attributeID = attributeIDs[ attributeName ];
				attribute = decoder.GetAttributeByUniqueId( dracoGeometry, attributeID );

			} else {

				attributeID = decoder.GetAttributeId( dracoGeometry, draco[ attributeIDs[ attributeName ] ] );

				if ( attributeID === - 1 ) continue;

				attribute = decoder.GetAttribute( dracoGeometry, attributeID );

			}

			const attributeResult = decodeAttribute( draco, decoder, dracoGeometry, attributeName, attributeType, attribute );

			if ( attributeName === 'color' ) {

				attributeResult.vertexColorSpace = taskConfig.vertexColorSpace;

			}

			geometry.attributes.push( attributeResult );

		}

		// Add index.
		if ( geometryType === draco.TRIANGULAR_MESH ) {

			geometry.index = decodeIndex( draco, decoder, dracoGeometry );

		}

		draco.destroy( dracoGeometry );

		return geometry;

	}

	function decodeIndex( draco, decoder, dracoGeometry ) {

		const numFaces = dracoGeometry.num_faces();
		const numIndices = numFaces * 3;
		const byteLength = numIndices * 4;

		const ptr = draco._malloc( byteLength );
		decoder.GetTrianglesUInt32Array( dracoGeometry, byteLength, ptr );
		const index = new Uint32Array( draco.HEAPF32.buffer, ptr, numIndices ).slice();
		draco._free( ptr );

		return { array: index, itemSize: 1 };

	}

	function decodeAttribute( draco, decoder, dracoGeometry, attributeName, attributeType, attribute ) {

		const numComponents = attribute.num_components();
		const numPoints = dracoGeometry.num_points();
		const numValues = numPoints * numComponents;
		const byteLength = numValues * attributeType.BYTES_PER_ELEMENT;
		const dataType = getDracoDataType( draco, attributeType );

		const ptr = draco._malloc( byteLength );
		decoder.GetAttributeDataArrayForAllPoints( dracoGeometry, attribute, dataType, byteLength, ptr );
		const array = new attributeType( draco.HEAPF32.buffer, ptr, numValues ).slice();
		draco._free( ptr );

		return {
			name: attributeName,
			array: array,
			itemSize: numComponents
		};

	}

	function getDracoDataType( draco, attributeType ) {

		switch ( attributeType ) {

			case Float32Array: return draco.DT_FLOAT32;
			case Int8Array: return draco.DT_INT8;
			case Int16Array: return draco.DT_INT16;
			case Int32Array: return draco.DT_INT32;
			case Uint8Array: return draco.DT_UINT8;
			case Uint16Array: return draco.DT_UINT16;
			case Uint32Array: return draco.DT_UINT32;

		}

	}

}

export { DRACOLoader };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRFJBQ09Mb2FkZXIuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYXRoL01hdGhVdGlscy5qcyIsIi4uL3NyYy9tYXRoL1F1YXRlcm5pb24uanMiLCIuLi9zcmMvbWF0aC9WZWN0b3IzLmpzIiwiLi4vc3JjL21hdGgvVmVjdG9yMi5qcyIsIi4uL3NyYy9jb25zdGFudHMuanMiLCIuLi9zcmMvY29yZS9CdWZmZXJBdHRyaWJ1dGUuanMiLCIuLi9zcmMvbWF0aC9Cb3gzLmpzIiwiLi4vc3JjL2NvcmUvRXZlbnREaXNwYXRjaGVyLmpzIiwiLi4vc3JjL21hdGgvU3BoZXJlLmpzIiwiLi4vc3JjL21hdGgvTWF0cml4NC5qcyIsIi4uL3NyYy9tYXRoL0V1bGVyLmpzIiwiLi4vc3JjL2NvcmUvTGF5ZXJzLmpzIiwiLi4vc3JjL21hdGgvTWF0cml4My5qcyIsIi4uL3NyYy9jb3JlL09iamVjdDNELmpzIiwiLi4vc3JjL3V0aWxzLmpzIiwiLi4vc3JjL2NvcmUvQnVmZmVyR2VvbWV0cnkuanMiLCIuLi9zcmMvbWF0aC9Db2xvck1hbmFnZW1lbnQuanMiLCIuLi9zcmMvbWF0aC9Db2xvci5qcyIsIi4uL3NyYy9sb2FkZXJzL0NhY2hlLmpzIiwiLi4vc3JjL2xvYWRlcnMvTG9hZGluZ01hbmFnZXIuanMiLCIuLi9zcmMvbG9hZGVycy9Mb2FkZXIuanMiLCIuLi9zcmMvbG9hZGVycy9GaWxlTG9hZGVyLmpzIiwiLi4vZXhhbXBsZXMvanNtL2xvYWRlcnMvRFJBQ09Mb2FkZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgX2x1dCA9IFsgJzAwJywgJzAxJywgJzAyJywgJzAzJywgJzA0JywgJzA1JywgJzA2JywgJzA3JywgJzA4JywgJzA5JywgJzBhJywgJzBiJywgJzBjJywgJzBkJywgJzBlJywgJzBmJywgJzEwJywgJzExJywgJzEyJywgJzEzJywgJzE0JywgJzE1JywgJzE2JywgJzE3JywgJzE4JywgJzE5JywgJzFhJywgJzFiJywgJzFjJywgJzFkJywgJzFlJywgJzFmJywgJzIwJywgJzIxJywgJzIyJywgJzIzJywgJzI0JywgJzI1JywgJzI2JywgJzI3JywgJzI4JywgJzI5JywgJzJhJywgJzJiJywgJzJjJywgJzJkJywgJzJlJywgJzJmJywgJzMwJywgJzMxJywgJzMyJywgJzMzJywgJzM0JywgJzM1JywgJzM2JywgJzM3JywgJzM4JywgJzM5JywgJzNhJywgJzNiJywgJzNjJywgJzNkJywgJzNlJywgJzNmJywgJzQwJywgJzQxJywgJzQyJywgJzQzJywgJzQ0JywgJzQ1JywgJzQ2JywgJzQ3JywgJzQ4JywgJzQ5JywgJzRhJywgJzRiJywgJzRjJywgJzRkJywgJzRlJywgJzRmJywgJzUwJywgJzUxJywgJzUyJywgJzUzJywgJzU0JywgJzU1JywgJzU2JywgJzU3JywgJzU4JywgJzU5JywgJzVhJywgJzViJywgJzVjJywgJzVkJywgJzVlJywgJzVmJywgJzYwJywgJzYxJywgJzYyJywgJzYzJywgJzY0JywgJzY1JywgJzY2JywgJzY3JywgJzY4JywgJzY5JywgJzZhJywgJzZiJywgJzZjJywgJzZkJywgJzZlJywgJzZmJywgJzcwJywgJzcxJywgJzcyJywgJzczJywgJzc0JywgJzc1JywgJzc2JywgJzc3JywgJzc4JywgJzc5JywgJzdhJywgJzdiJywgJzdjJywgJzdkJywgJzdlJywgJzdmJywgJzgwJywgJzgxJywgJzgyJywgJzgzJywgJzg0JywgJzg1JywgJzg2JywgJzg3JywgJzg4JywgJzg5JywgJzhhJywgJzhiJywgJzhjJywgJzhkJywgJzhlJywgJzhmJywgJzkwJywgJzkxJywgJzkyJywgJzkzJywgJzk0JywgJzk1JywgJzk2JywgJzk3JywgJzk4JywgJzk5JywgJzlhJywgJzliJywgJzljJywgJzlkJywgJzllJywgJzlmJywgJ2EwJywgJ2ExJywgJ2EyJywgJ2EzJywgJ2E0JywgJ2E1JywgJ2E2JywgJ2E3JywgJ2E4JywgJ2E5JywgJ2FhJywgJ2FiJywgJ2FjJywgJ2FkJywgJ2FlJywgJ2FmJywgJ2IwJywgJ2IxJywgJ2IyJywgJ2IzJywgJ2I0JywgJ2I1JywgJ2I2JywgJ2I3JywgJ2I4JywgJ2I5JywgJ2JhJywgJ2JiJywgJ2JjJywgJ2JkJywgJ2JlJywgJ2JmJywgJ2MwJywgJ2MxJywgJ2MyJywgJ2MzJywgJ2M0JywgJ2M1JywgJ2M2JywgJ2M3JywgJ2M4JywgJ2M5JywgJ2NhJywgJ2NiJywgJ2NjJywgJ2NkJywgJ2NlJywgJ2NmJywgJ2QwJywgJ2QxJywgJ2QyJywgJ2QzJywgJ2Q0JywgJ2Q1JywgJ2Q2JywgJ2Q3JywgJ2Q4JywgJ2Q5JywgJ2RhJywgJ2RiJywgJ2RjJywgJ2RkJywgJ2RlJywgJ2RmJywgJ2UwJywgJ2UxJywgJ2UyJywgJ2UzJywgJ2U0JywgJ2U1JywgJ2U2JywgJ2U3JywgJ2U4JywgJ2U5JywgJ2VhJywgJ2ViJywgJ2VjJywgJ2VkJywgJ2VlJywgJ2VmJywgJ2YwJywgJ2YxJywgJ2YyJywgJ2YzJywgJ2Y0JywgJ2Y1JywgJ2Y2JywgJ2Y3JywgJ2Y4JywgJ2Y5JywgJ2ZhJywgJ2ZiJywgJ2ZjJywgJ2ZkJywgJ2ZlJywgJ2ZmJyBdO1xuXG5sZXQgX3NlZWQgPSAxMjM0NTY3O1xuXG5cbmNvbnN0IERFRzJSQUQgPSBNYXRoLlBJIC8gMTgwO1xuY29uc3QgUkFEMkRFRyA9IDE4MCAvIE1hdGguUEk7XG5cbi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTA1MDM0L2hvdy10by1jcmVhdGUtYS1ndWlkLXV1aWQtaW4tamF2YXNjcmlwdC8yMTk2MzEzNiMyMTk2MzEzNlxuZnVuY3Rpb24gZ2VuZXJhdGVVVUlEKCkge1xuXG5cdGNvbnN0IGQwID0gTWF0aC5yYW5kb20oKSAqIDB4ZmZmZmZmZmYgfCAwO1xuXHRjb25zdCBkMSA9IE1hdGgucmFuZG9tKCkgKiAweGZmZmZmZmZmIHwgMDtcblx0Y29uc3QgZDIgPSBNYXRoLnJhbmRvbSgpICogMHhmZmZmZmZmZiB8IDA7XG5cdGNvbnN0IGQzID0gTWF0aC5yYW5kb20oKSAqIDB4ZmZmZmZmZmYgfCAwO1xuXHRjb25zdCB1dWlkID0gX2x1dFsgZDAgJiAweGZmIF0gKyBfbHV0WyBkMCA+PiA4ICYgMHhmZiBdICsgX2x1dFsgZDAgPj4gMTYgJiAweGZmIF0gKyBfbHV0WyBkMCA+PiAyNCAmIDB4ZmYgXSArICctJyArXG5cdFx0XHRfbHV0WyBkMSAmIDB4ZmYgXSArIF9sdXRbIGQxID4+IDggJiAweGZmIF0gKyAnLScgKyBfbHV0WyBkMSA+PiAxNiAmIDB4MGYgfCAweDQwIF0gKyBfbHV0WyBkMSA+PiAyNCAmIDB4ZmYgXSArICctJyArXG5cdFx0XHRfbHV0WyBkMiAmIDB4M2YgfCAweDgwIF0gKyBfbHV0WyBkMiA+PiA4ICYgMHhmZiBdICsgJy0nICsgX2x1dFsgZDIgPj4gMTYgJiAweGZmIF0gKyBfbHV0WyBkMiA+PiAyNCAmIDB4ZmYgXSArXG5cdFx0XHRfbHV0WyBkMyAmIDB4ZmYgXSArIF9sdXRbIGQzID4+IDggJiAweGZmIF0gKyBfbHV0WyBkMyA+PiAxNiAmIDB4ZmYgXSArIF9sdXRbIGQzID4+IDI0ICYgMHhmZiBdO1xuXG5cdC8vIC50b0xvd2VyQ2FzZSgpIGhlcmUgZmxhdHRlbnMgY29uY2F0ZW5hdGVkIHN0cmluZ3MgdG8gc2F2ZSBoZWFwIG1lbW9yeSBzcGFjZS5cblx0cmV0dXJuIHV1aWQudG9Mb3dlckNhc2UoKTtcblxufVxuXG5mdW5jdGlvbiBjbGFtcCggdmFsdWUsIG1pbiwgbWF4ICkge1xuXG5cdHJldHVybiBNYXRoLm1heCggbWluLCBNYXRoLm1pbiggbWF4LCB2YWx1ZSApICk7XG5cbn1cblxuLy8gY29tcHV0ZSBldWNsaWRlYW4gbW9kdWxvIG9mIG0gJSBuXG4vLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Nb2R1bG9fb3BlcmF0aW9uXG5mdW5jdGlvbiBldWNsaWRlYW5Nb2R1bG8oIG4sIG0gKSB7XG5cblx0cmV0dXJuICggKCBuICUgbSApICsgbSApICUgbTtcblxufVxuXG4vLyBMaW5lYXIgbWFwcGluZyBmcm9tIHJhbmdlIDxhMSwgYTI+IHRvIHJhbmdlIDxiMSwgYjI+XG5mdW5jdGlvbiBtYXBMaW5lYXIoIHgsIGExLCBhMiwgYjEsIGIyICkge1xuXG5cdHJldHVybiBiMSArICggeCAtIGExICkgKiAoIGIyIC0gYjEgKSAvICggYTIgLSBhMSApO1xuXG59XG5cbi8vIGh0dHBzOi8vd3d3LmdhbWVkZXYubmV0L3R1dG9yaWFscy9wcm9ncmFtbWluZy9nZW5lcmFsLWFuZC1nYW1lcGxheS1wcm9ncmFtbWluZy9pbnZlcnNlLWxlcnAtYS1zdXBlci11c2VmdWwteWV0LW9mdGVuLW92ZXJsb29rZWQtZnVuY3Rpb24tcjUyMzAvXG5mdW5jdGlvbiBpbnZlcnNlTGVycCggeCwgeSwgdmFsdWUgKSB7XG5cblx0aWYgKCB4ICE9PSB5ICkge1xuXG5cdFx0cmV0dXJuICggdmFsdWUgLSB4ICkgLyAoIHkgLSB4ICk7XG5cblx0fSBlbHNlIHtcblxuXHRcdHJldHVybiAwO1xuXG5cdH1cblxufVxuXG4vLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaW5lYXJfaW50ZXJwb2xhdGlvblxuZnVuY3Rpb24gbGVycCggeCwgeSwgdCApIHtcblxuXHRyZXR1cm4gKCAxIC0gdCApICogeCArIHQgKiB5O1xuXG59XG5cbi8vIGh0dHA6Ly93d3cucm9yeWRyaXNjb2xsLmNvbS8yMDE2LzAzLzA3L2ZyYW1lLXJhdGUtaW5kZXBlbmRlbnQtZGFtcGluZy11c2luZy1sZXJwL1xuZnVuY3Rpb24gZGFtcCggeCwgeSwgbGFtYmRhLCBkdCApIHtcblxuXHRyZXR1cm4gbGVycCggeCwgeSwgMSAtIE1hdGguZXhwKCAtIGxhbWJkYSAqIGR0ICkgKTtcblxufVxuXG4vLyBodHRwczovL3d3dy5kZXNtb3MuY29tL2NhbGN1bGF0b3IvdmNzam55ejd4NFxuZnVuY3Rpb24gcGluZ3BvbmcoIHgsIGxlbmd0aCA9IDEgKSB7XG5cblx0cmV0dXJuIGxlbmd0aCAtIE1hdGguYWJzKCBldWNsaWRlYW5Nb2R1bG8oIHgsIGxlbmd0aCAqIDIgKSAtIGxlbmd0aCApO1xuXG59XG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU21vb3Roc3RlcFxuZnVuY3Rpb24gc21vb3Roc3RlcCggeCwgbWluLCBtYXggKSB7XG5cblx0aWYgKCB4IDw9IG1pbiApIHJldHVybiAwO1xuXHRpZiAoIHggPj0gbWF4ICkgcmV0dXJuIDE7XG5cblx0eCA9ICggeCAtIG1pbiApIC8gKCBtYXggLSBtaW4gKTtcblxuXHRyZXR1cm4geCAqIHggKiAoIDMgLSAyICogeCApO1xuXG59XG5cbmZ1bmN0aW9uIHNtb290aGVyc3RlcCggeCwgbWluLCBtYXggKSB7XG5cblx0aWYgKCB4IDw9IG1pbiApIHJldHVybiAwO1xuXHRpZiAoIHggPj0gbWF4ICkgcmV0dXJuIDE7XG5cblx0eCA9ICggeCAtIG1pbiApIC8gKCBtYXggLSBtaW4gKTtcblxuXHRyZXR1cm4geCAqIHggKiB4ICogKCB4ICogKCB4ICogNiAtIDE1ICkgKyAxMCApO1xuXG59XG5cbi8vIFJhbmRvbSBpbnRlZ2VyIGZyb20gPGxvdywgaGlnaD4gaW50ZXJ2YWxcbmZ1bmN0aW9uIHJhbmRJbnQoIGxvdywgaGlnaCApIHtcblxuXHRyZXR1cm4gbG93ICsgTWF0aC5mbG9vciggTWF0aC5yYW5kb20oKSAqICggaGlnaCAtIGxvdyArIDEgKSApO1xuXG59XG5cbi8vIFJhbmRvbSBmbG9hdCBmcm9tIDxsb3csIGhpZ2g+IGludGVydmFsXG5mdW5jdGlvbiByYW5kRmxvYXQoIGxvdywgaGlnaCApIHtcblxuXHRyZXR1cm4gbG93ICsgTWF0aC5yYW5kb20oKSAqICggaGlnaCAtIGxvdyApO1xuXG59XG5cbi8vIFJhbmRvbSBmbG9hdCBmcm9tIDwtcmFuZ2UvMiwgcmFuZ2UvMj4gaW50ZXJ2YWxcbmZ1bmN0aW9uIHJhbmRGbG9hdFNwcmVhZCggcmFuZ2UgKSB7XG5cblx0cmV0dXJuIHJhbmdlICogKCAwLjUgLSBNYXRoLnJhbmRvbSgpICk7XG5cbn1cblxuLy8gRGV0ZXJtaW5pc3RpYyBwc2V1ZG8tcmFuZG9tIGZsb2F0IGluIHRoZSBpbnRlcnZhbCBbIDAsIDEgXVxuZnVuY3Rpb24gc2VlZGVkUmFuZG9tKCBzICkge1xuXG5cdGlmICggcyAhPT0gdW5kZWZpbmVkICkgX3NlZWQgPSBzO1xuXG5cdC8vIE11bGJlcnJ5MzIgZ2VuZXJhdG9yXG5cblx0bGV0IHQgPSBfc2VlZCArPSAweDZEMkI3OUY1O1xuXG5cdHQgPSBNYXRoLmltdWwoIHQgXiB0ID4+PiAxNSwgdCB8IDEgKTtcblxuXHR0IF49IHQgKyBNYXRoLmltdWwoIHQgXiB0ID4+PiA3LCB0IHwgNjEgKTtcblxuXHRyZXR1cm4gKCAoIHQgXiB0ID4+PiAxNCApID4+PiAwICkgLyA0Mjk0OTY3Mjk2O1xuXG59XG5cbmZ1bmN0aW9uIGRlZ1RvUmFkKCBkZWdyZWVzICkge1xuXG5cdHJldHVybiBkZWdyZWVzICogREVHMlJBRDtcblxufVxuXG5mdW5jdGlvbiByYWRUb0RlZyggcmFkaWFucyApIHtcblxuXHRyZXR1cm4gcmFkaWFucyAqIFJBRDJERUc7XG5cbn1cblxuZnVuY3Rpb24gaXNQb3dlck9mVHdvKCB2YWx1ZSApIHtcblxuXHRyZXR1cm4gKCB2YWx1ZSAmICggdmFsdWUgLSAxICkgKSA9PT0gMCAmJiB2YWx1ZSAhPT0gMDtcblxufVxuXG5mdW5jdGlvbiBjZWlsUG93ZXJPZlR3byggdmFsdWUgKSB7XG5cblx0cmV0dXJuIE1hdGgucG93KCAyLCBNYXRoLmNlaWwoIE1hdGgubG9nKCB2YWx1ZSApIC8gTWF0aC5MTjIgKSApO1xuXG59XG5cbmZ1bmN0aW9uIGZsb29yUG93ZXJPZlR3byggdmFsdWUgKSB7XG5cblx0cmV0dXJuIE1hdGgucG93KCAyLCBNYXRoLmZsb29yKCBNYXRoLmxvZyggdmFsdWUgKSAvIE1hdGguTE4yICkgKTtcblxufVxuXG5mdW5jdGlvbiBzZXRRdWF0ZXJuaW9uRnJvbVByb3BlckV1bGVyKCBxLCBhLCBiLCBjLCBvcmRlciApIHtcblxuXHQvLyBJbnRyaW5zaWMgUHJvcGVyIEV1bGVyIEFuZ2xlcyAtIHNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9FdWxlcl9hbmdsZXNcblxuXHQvLyByb3RhdGlvbnMgYXJlIGFwcGxpZWQgdG8gdGhlIGF4ZXMgaW4gdGhlIG9yZGVyIHNwZWNpZmllZCBieSAnb3JkZXInXG5cdC8vIHJvdGF0aW9uIGJ5IGFuZ2xlICdhJyBpcyBhcHBsaWVkIGZpcnN0LCB0aGVuIGJ5IGFuZ2xlICdiJywgdGhlbiBieSBhbmdsZSAnYydcblx0Ly8gYW5nbGVzIGFyZSBpbiByYWRpYW5zXG5cblx0Y29uc3QgY29zID0gTWF0aC5jb3M7XG5cdGNvbnN0IHNpbiA9IE1hdGguc2luO1xuXG5cdGNvbnN0IGMyID0gY29zKCBiIC8gMiApO1xuXHRjb25zdCBzMiA9IHNpbiggYiAvIDIgKTtcblxuXHRjb25zdCBjMTMgPSBjb3MoICggYSArIGMgKSAvIDIgKTtcblx0Y29uc3QgczEzID0gc2luKCAoIGEgKyBjICkgLyAyICk7XG5cblx0Y29uc3QgYzFfMyA9IGNvcyggKCBhIC0gYyApIC8gMiApO1xuXHRjb25zdCBzMV8zID0gc2luKCAoIGEgLSBjICkgLyAyICk7XG5cblx0Y29uc3QgYzNfMSA9IGNvcyggKCBjIC0gYSApIC8gMiApO1xuXHRjb25zdCBzM18xID0gc2luKCAoIGMgLSBhICkgLyAyICk7XG5cblx0c3dpdGNoICggb3JkZXIgKSB7XG5cblx0XHRjYXNlICdYWVgnOlxuXHRcdFx0cS5zZXQoIGMyICogczEzLCBzMiAqIGMxXzMsIHMyICogczFfMywgYzIgKiBjMTMgKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSAnWVpZJzpcblx0XHRcdHEuc2V0KCBzMiAqIHMxXzMsIGMyICogczEzLCBzMiAqIGMxXzMsIGMyICogYzEzICk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgJ1pYWic6XG5cdFx0XHRxLnNldCggczIgKiBjMV8zLCBzMiAqIHMxXzMsIGMyICogczEzLCBjMiAqIGMxMyApO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlICdYWlgnOlxuXHRcdFx0cS5zZXQoIGMyICogczEzLCBzMiAqIHMzXzEsIHMyICogYzNfMSwgYzIgKiBjMTMgKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSAnWVhZJzpcblx0XHRcdHEuc2V0KCBzMiAqIGMzXzEsIGMyICogczEzLCBzMiAqIHMzXzEsIGMyICogYzEzICk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgJ1pZWic6XG5cdFx0XHRxLnNldCggczIgKiBzM18xLCBzMiAqIGMzXzEsIGMyICogczEzLCBjMiAqIGMxMyApO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRkZWZhdWx0OlxuXHRcdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuTWF0aFV0aWxzOiAuc2V0UXVhdGVybmlvbkZyb21Qcm9wZXJFdWxlcigpIGVuY291bnRlcmVkIGFuIHVua25vd24gb3JkZXI6ICcgKyBvcmRlciApO1xuXG5cdH1cblxufVxuXG5mdW5jdGlvbiBkZW5vcm1hbGl6ZSggdmFsdWUsIGFycmF5ICkge1xuXG5cdHN3aXRjaCAoIGFycmF5LmNvbnN0cnVjdG9yICkge1xuXG5cdFx0Y2FzZSBGbG9hdDMyQXJyYXk6XG5cblx0XHRcdHJldHVybiB2YWx1ZTtcblxuXHRcdGNhc2UgVWludDMyQXJyYXk6XG5cblx0XHRcdHJldHVybiB2YWx1ZSAvIDQyOTQ5NjcyOTUuMDtcblxuXHRcdGNhc2UgVWludDE2QXJyYXk6XG5cblx0XHRcdHJldHVybiB2YWx1ZSAvIDY1NTM1LjA7XG5cblx0XHRjYXNlIFVpbnQ4QXJyYXk6XG5cblx0XHRcdHJldHVybiB2YWx1ZSAvIDI1NS4wO1xuXG5cdFx0Y2FzZSBJbnQzMkFycmF5OlxuXG5cdFx0XHRyZXR1cm4gTWF0aC5tYXgoIHZhbHVlIC8gMjE0NzQ4MzY0Ny4wLCAtIDEuMCApO1xuXG5cdFx0Y2FzZSBJbnQxNkFycmF5OlxuXG5cdFx0XHRyZXR1cm4gTWF0aC5tYXgoIHZhbHVlIC8gMzI3NjcuMCwgLSAxLjAgKTtcblxuXHRcdGNhc2UgSW50OEFycmF5OlxuXG5cdFx0XHRyZXR1cm4gTWF0aC5tYXgoIHZhbHVlIC8gMTI3LjAsIC0gMS4wICk7XG5cblx0XHRkZWZhdWx0OlxuXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoICdJbnZhbGlkIGNvbXBvbmVudCB0eXBlLicgKTtcblxuXHR9XG5cbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplKCB2YWx1ZSwgYXJyYXkgKSB7XG5cblx0c3dpdGNoICggYXJyYXkuY29uc3RydWN0b3IgKSB7XG5cblx0XHRjYXNlIEZsb2F0MzJBcnJheTpcblxuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXG5cdFx0Y2FzZSBVaW50MzJBcnJheTpcblxuXHRcdFx0cmV0dXJuIE1hdGgucm91bmQoIHZhbHVlICogNDI5NDk2NzI5NS4wICk7XG5cblx0XHRjYXNlIFVpbnQxNkFycmF5OlxuXG5cdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCggdmFsdWUgKiA2NTUzNS4wICk7XG5cblx0XHRjYXNlIFVpbnQ4QXJyYXk6XG5cblx0XHRcdHJldHVybiBNYXRoLnJvdW5kKCB2YWx1ZSAqIDI1NS4wICk7XG5cblx0XHRjYXNlIEludDMyQXJyYXk6XG5cblx0XHRcdHJldHVybiBNYXRoLnJvdW5kKCB2YWx1ZSAqIDIxNDc0ODM2NDcuMCApO1xuXG5cdFx0Y2FzZSBJbnQxNkFycmF5OlxuXG5cdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCggdmFsdWUgKiAzMjc2Ny4wICk7XG5cblx0XHRjYXNlIEludDhBcnJheTpcblxuXHRcdFx0cmV0dXJuIE1hdGgucm91bmQoIHZhbHVlICogMTI3LjAgKTtcblxuXHRcdGRlZmF1bHQ6XG5cblx0XHRcdHRocm93IG5ldyBFcnJvciggJ0ludmFsaWQgY29tcG9uZW50IHR5cGUuJyApO1xuXG5cdH1cblxufVxuXG5jb25zdCBNYXRoVXRpbHMgPSB7XG5cdERFRzJSQUQ6IERFRzJSQUQsXG5cdFJBRDJERUc6IFJBRDJERUcsXG5cdGdlbmVyYXRlVVVJRDogZ2VuZXJhdGVVVUlELFxuXHRjbGFtcDogY2xhbXAsXG5cdGV1Y2xpZGVhbk1vZHVsbzogZXVjbGlkZWFuTW9kdWxvLFxuXHRtYXBMaW5lYXI6IG1hcExpbmVhcixcblx0aW52ZXJzZUxlcnA6IGludmVyc2VMZXJwLFxuXHRsZXJwOiBsZXJwLFxuXHRkYW1wOiBkYW1wLFxuXHRwaW5ncG9uZzogcGluZ3BvbmcsXG5cdHNtb290aHN0ZXA6IHNtb290aHN0ZXAsXG5cdHNtb290aGVyc3RlcDogc21vb3RoZXJzdGVwLFxuXHRyYW5kSW50OiByYW5kSW50LFxuXHRyYW5kRmxvYXQ6IHJhbmRGbG9hdCxcblx0cmFuZEZsb2F0U3ByZWFkOiByYW5kRmxvYXRTcHJlYWQsXG5cdHNlZWRlZFJhbmRvbTogc2VlZGVkUmFuZG9tLFxuXHRkZWdUb1JhZDogZGVnVG9SYWQsXG5cdHJhZFRvRGVnOiByYWRUb0RlZyxcblx0aXNQb3dlck9mVHdvOiBpc1Bvd2VyT2ZUd28sXG5cdGNlaWxQb3dlck9mVHdvOiBjZWlsUG93ZXJPZlR3byxcblx0Zmxvb3JQb3dlck9mVHdvOiBmbG9vclBvd2VyT2ZUd28sXG5cdHNldFF1YXRlcm5pb25Gcm9tUHJvcGVyRXVsZXI6IHNldFF1YXRlcm5pb25Gcm9tUHJvcGVyRXVsZXIsXG5cdG5vcm1hbGl6ZTogbm9ybWFsaXplLFxuXHRkZW5vcm1hbGl6ZTogZGVub3JtYWxpemVcbn07XG5cbmV4cG9ydCB7XG5cdERFRzJSQUQsXG5cdFJBRDJERUcsXG5cdGdlbmVyYXRlVVVJRCxcblx0Y2xhbXAsXG5cdGV1Y2xpZGVhbk1vZHVsbyxcblx0bWFwTGluZWFyLFxuXHRpbnZlcnNlTGVycCxcblx0bGVycCxcblx0ZGFtcCxcblx0cGluZ3BvbmcsXG5cdHNtb290aHN0ZXAsXG5cdHNtb290aGVyc3RlcCxcblx0cmFuZEludCxcblx0cmFuZEZsb2F0LFxuXHRyYW5kRmxvYXRTcHJlYWQsXG5cdHNlZWRlZFJhbmRvbSxcblx0ZGVnVG9SYWQsXG5cdHJhZFRvRGVnLFxuXHRpc1Bvd2VyT2ZUd28sXG5cdGNlaWxQb3dlck9mVHdvLFxuXHRmbG9vclBvd2VyT2ZUd28sXG5cdHNldFF1YXRlcm5pb25Gcm9tUHJvcGVyRXVsZXIsXG5cdG5vcm1hbGl6ZSxcblx0ZGVub3JtYWxpemUsXG5cdE1hdGhVdGlsc1xufTtcbiIsImltcG9ydCAqIGFzIE1hdGhVdGlscyBmcm9tICcuL01hdGhVdGlscy5qcyc7XG5cbmNsYXNzIFF1YXRlcm5pb24ge1xuXG5cdGNvbnN0cnVjdG9yKCB4ID0gMCwgeSA9IDAsIHogPSAwLCB3ID0gMSApIHtcblxuXHRcdHRoaXMuaXNRdWF0ZXJuaW9uID0gdHJ1ZTtcblxuXHRcdHRoaXMuX3ggPSB4O1xuXHRcdHRoaXMuX3kgPSB5O1xuXHRcdHRoaXMuX3ogPSB6O1xuXHRcdHRoaXMuX3cgPSB3O1xuXG5cdH1cblxuXHRzdGF0aWMgc2xlcnBGbGF0KCBkc3QsIGRzdE9mZnNldCwgc3JjMCwgc3JjT2Zmc2V0MCwgc3JjMSwgc3JjT2Zmc2V0MSwgdCApIHtcblxuXHRcdC8vIGZ1enotZnJlZSwgYXJyYXktYmFzZWQgUXVhdGVybmlvbiBTTEVSUCBvcGVyYXRpb25cblxuXHRcdGxldCB4MCA9IHNyYzBbIHNyY09mZnNldDAgKyAwIF0sXG5cdFx0XHR5MCA9IHNyYzBbIHNyY09mZnNldDAgKyAxIF0sXG5cdFx0XHR6MCA9IHNyYzBbIHNyY09mZnNldDAgKyAyIF0sXG5cdFx0XHR3MCA9IHNyYzBbIHNyY09mZnNldDAgKyAzIF07XG5cblx0XHRjb25zdCB4MSA9IHNyYzFbIHNyY09mZnNldDEgKyAwIF0sXG5cdFx0XHR5MSA9IHNyYzFbIHNyY09mZnNldDEgKyAxIF0sXG5cdFx0XHR6MSA9IHNyYzFbIHNyY09mZnNldDEgKyAyIF0sXG5cdFx0XHR3MSA9IHNyYzFbIHNyY09mZnNldDEgKyAzIF07XG5cblx0XHRpZiAoIHQgPT09IDAgKSB7XG5cblx0XHRcdGRzdFsgZHN0T2Zmc2V0ICsgMCBdID0geDA7XG5cdFx0XHRkc3RbIGRzdE9mZnNldCArIDEgXSA9IHkwO1xuXHRcdFx0ZHN0WyBkc3RPZmZzZXQgKyAyIF0gPSB6MDtcblx0XHRcdGRzdFsgZHN0T2Zmc2V0ICsgMyBdID0gdzA7XG5cdFx0XHRyZXR1cm47XG5cblx0XHR9XG5cblx0XHRpZiAoIHQgPT09IDEgKSB7XG5cblx0XHRcdGRzdFsgZHN0T2Zmc2V0ICsgMCBdID0geDE7XG5cdFx0XHRkc3RbIGRzdE9mZnNldCArIDEgXSA9IHkxO1xuXHRcdFx0ZHN0WyBkc3RPZmZzZXQgKyAyIF0gPSB6MTtcblx0XHRcdGRzdFsgZHN0T2Zmc2V0ICsgMyBdID0gdzE7XG5cdFx0XHRyZXR1cm47XG5cblx0XHR9XG5cblx0XHRpZiAoIHcwICE9PSB3MSB8fCB4MCAhPT0geDEgfHwgeTAgIT09IHkxIHx8IHowICE9PSB6MSApIHtcblxuXHRcdFx0bGV0IHMgPSAxIC0gdDtcblx0XHRcdGNvbnN0IGNvcyA9IHgwICogeDEgKyB5MCAqIHkxICsgejAgKiB6MSArIHcwICogdzEsXG5cdFx0XHRcdGRpciA9ICggY29zID49IDAgPyAxIDogLSAxICksXG5cdFx0XHRcdHNxclNpbiA9IDEgLSBjb3MgKiBjb3M7XG5cblx0XHRcdC8vIFNraXAgdGhlIFNsZXJwIGZvciB0aW55IHN0ZXBzIHRvIGF2b2lkIG51bWVyaWMgcHJvYmxlbXM6XG5cdFx0XHRpZiAoIHNxclNpbiA+IE51bWJlci5FUFNJTE9OICkge1xuXG5cdFx0XHRcdGNvbnN0IHNpbiA9IE1hdGguc3FydCggc3FyU2luICksXG5cdFx0XHRcdFx0bGVuID0gTWF0aC5hdGFuMiggc2luLCBjb3MgKiBkaXIgKTtcblxuXHRcdFx0XHRzID0gTWF0aC5zaW4oIHMgKiBsZW4gKSAvIHNpbjtcblx0XHRcdFx0dCA9IE1hdGguc2luKCB0ICogbGVuICkgLyBzaW47XG5cblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgdERpciA9IHQgKiBkaXI7XG5cblx0XHRcdHgwID0geDAgKiBzICsgeDEgKiB0RGlyO1xuXHRcdFx0eTAgPSB5MCAqIHMgKyB5MSAqIHREaXI7XG5cdFx0XHR6MCA9IHowICogcyArIHoxICogdERpcjtcblx0XHRcdHcwID0gdzAgKiBzICsgdzEgKiB0RGlyO1xuXG5cdFx0XHQvLyBOb3JtYWxpemUgaW4gY2FzZSB3ZSBqdXN0IGRpZCBhIGxlcnA6XG5cdFx0XHRpZiAoIHMgPT09IDEgLSB0ICkge1xuXG5cdFx0XHRcdGNvbnN0IGYgPSAxIC8gTWF0aC5zcXJ0KCB4MCAqIHgwICsgeTAgKiB5MCArIHowICogejAgKyB3MCAqIHcwICk7XG5cblx0XHRcdFx0eDAgKj0gZjtcblx0XHRcdFx0eTAgKj0gZjtcblx0XHRcdFx0ejAgKj0gZjtcblx0XHRcdFx0dzAgKj0gZjtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0ZHN0WyBkc3RPZmZzZXQgXSA9IHgwO1xuXHRcdGRzdFsgZHN0T2Zmc2V0ICsgMSBdID0geTA7XG5cdFx0ZHN0WyBkc3RPZmZzZXQgKyAyIF0gPSB6MDtcblx0XHRkc3RbIGRzdE9mZnNldCArIDMgXSA9IHcwO1xuXG5cdH1cblxuXHRzdGF0aWMgbXVsdGlwbHlRdWF0ZXJuaW9uc0ZsYXQoIGRzdCwgZHN0T2Zmc2V0LCBzcmMwLCBzcmNPZmZzZXQwLCBzcmMxLCBzcmNPZmZzZXQxICkge1xuXG5cdFx0Y29uc3QgeDAgPSBzcmMwWyBzcmNPZmZzZXQwIF07XG5cdFx0Y29uc3QgeTAgPSBzcmMwWyBzcmNPZmZzZXQwICsgMSBdO1xuXHRcdGNvbnN0IHowID0gc3JjMFsgc3JjT2Zmc2V0MCArIDIgXTtcblx0XHRjb25zdCB3MCA9IHNyYzBbIHNyY09mZnNldDAgKyAzIF07XG5cblx0XHRjb25zdCB4MSA9IHNyYzFbIHNyY09mZnNldDEgXTtcblx0XHRjb25zdCB5MSA9IHNyYzFbIHNyY09mZnNldDEgKyAxIF07XG5cdFx0Y29uc3QgejEgPSBzcmMxWyBzcmNPZmZzZXQxICsgMiBdO1xuXHRcdGNvbnN0IHcxID0gc3JjMVsgc3JjT2Zmc2V0MSArIDMgXTtcblxuXHRcdGRzdFsgZHN0T2Zmc2V0IF0gPSB4MCAqIHcxICsgdzAgKiB4MSArIHkwICogejEgLSB6MCAqIHkxO1xuXHRcdGRzdFsgZHN0T2Zmc2V0ICsgMSBdID0geTAgKiB3MSArIHcwICogeTEgKyB6MCAqIHgxIC0geDAgKiB6MTtcblx0XHRkc3RbIGRzdE9mZnNldCArIDIgXSA9IHowICogdzEgKyB3MCAqIHoxICsgeDAgKiB5MSAtIHkwICogeDE7XG5cdFx0ZHN0WyBkc3RPZmZzZXQgKyAzIF0gPSB3MCAqIHcxIC0geDAgKiB4MSAtIHkwICogeTEgLSB6MCAqIHoxO1xuXG5cdFx0cmV0dXJuIGRzdDtcblxuXHR9XG5cblx0Z2V0IHgoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5feDtcblxuXHR9XG5cblx0c2V0IHgoIHZhbHVlICkge1xuXG5cdFx0dGhpcy5feCA9IHZhbHVlO1xuXHRcdHRoaXMuX29uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHR9XG5cblx0Z2V0IHkoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5feTtcblxuXHR9XG5cblx0c2V0IHkoIHZhbHVlICkge1xuXG5cdFx0dGhpcy5feSA9IHZhbHVlO1xuXHRcdHRoaXMuX29uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHR9XG5cblx0Z2V0IHooKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5fejtcblxuXHR9XG5cblx0c2V0IHooIHZhbHVlICkge1xuXG5cdFx0dGhpcy5feiA9IHZhbHVlO1xuXHRcdHRoaXMuX29uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHR9XG5cblx0Z2V0IHcoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5fdztcblxuXHR9XG5cblx0c2V0IHcoIHZhbHVlICkge1xuXG5cdFx0dGhpcy5fdyA9IHZhbHVlO1xuXHRcdHRoaXMuX29uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHR9XG5cblx0c2V0KCB4LCB5LCB6LCB3ICkge1xuXG5cdFx0dGhpcy5feCA9IHg7XG5cdFx0dGhpcy5feSA9IHk7XG5cdFx0dGhpcy5feiA9IHo7XG5cdFx0dGhpcy5fdyA9IHc7XG5cblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y2xvbmUoKSB7XG5cblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoIHRoaXMuX3gsIHRoaXMuX3ksIHRoaXMuX3osIHRoaXMuX3cgKTtcblxuXHR9XG5cblx0Y29weSggcXVhdGVybmlvbiApIHtcblxuXHRcdHRoaXMuX3ggPSBxdWF0ZXJuaW9uLng7XG5cdFx0dGhpcy5feSA9IHF1YXRlcm5pb24ueTtcblx0XHR0aGlzLl96ID0gcXVhdGVybmlvbi56O1xuXHRcdHRoaXMuX3cgPSBxdWF0ZXJuaW9uLnc7XG5cblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0RnJvbUV1bGVyKCBldWxlciwgdXBkYXRlICkge1xuXG5cdFx0Y29uc3QgeCA9IGV1bGVyLl94LCB5ID0gZXVsZXIuX3ksIHogPSBldWxlci5feiwgb3JkZXIgPSBldWxlci5fb3JkZXI7XG5cblx0XHQvLyBodHRwOi8vd3d3Lm1hdGh3b3Jrcy5jb20vbWF0bGFiY2VudHJhbC9maWxlZXhjaGFuZ2UvXG5cdFx0Ly8gXHQyMDY5Ni1mdW5jdGlvbi10by1jb252ZXJ0LWJldHdlZW4tZGNtLWV1bGVyLWFuZ2xlcy1xdWF0ZXJuaW9ucy1hbmQtZXVsZXItdmVjdG9ycy9cblx0XHQvL1x0Y29udGVudC9TcGluQ2FsYy5tXG5cblx0XHRjb25zdCBjb3MgPSBNYXRoLmNvcztcblx0XHRjb25zdCBzaW4gPSBNYXRoLnNpbjtcblxuXHRcdGNvbnN0IGMxID0gY29zKCB4IC8gMiApO1xuXHRcdGNvbnN0IGMyID0gY29zKCB5IC8gMiApO1xuXHRcdGNvbnN0IGMzID0gY29zKCB6IC8gMiApO1xuXG5cdFx0Y29uc3QgczEgPSBzaW4oIHggLyAyICk7XG5cdFx0Y29uc3QgczIgPSBzaW4oIHkgLyAyICk7XG5cdFx0Y29uc3QgczMgPSBzaW4oIHogLyAyICk7XG5cblx0XHRzd2l0Y2ggKCBvcmRlciApIHtcblxuXHRcdFx0Y2FzZSAnWFlaJzpcblx0XHRcdFx0dGhpcy5feCA9IHMxICogYzIgKiBjMyArIGMxICogczIgKiBzMztcblx0XHRcdFx0dGhpcy5feSA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcblx0XHRcdFx0dGhpcy5feiA9IGMxICogYzIgKiBzMyArIHMxICogczIgKiBjMztcblx0XHRcdFx0dGhpcy5fdyA9IGMxICogYzIgKiBjMyAtIHMxICogczIgKiBzMztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ1lYWic6XG5cdFx0XHRcdHRoaXMuX3ggPSBzMSAqIGMyICogYzMgKyBjMSAqIHMyICogczM7XG5cdFx0XHRcdHRoaXMuX3kgPSBjMSAqIHMyICogYzMgLSBzMSAqIGMyICogczM7XG5cdFx0XHRcdHRoaXMuX3ogPSBjMSAqIGMyICogczMgLSBzMSAqIHMyICogYzM7XG5cdFx0XHRcdHRoaXMuX3cgPSBjMSAqIGMyICogYzMgKyBzMSAqIHMyICogczM7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdaWFknOlxuXHRcdFx0XHR0aGlzLl94ID0gczEgKiBjMiAqIGMzIC0gYzEgKiBzMiAqIHMzO1xuXHRcdFx0XHR0aGlzLl95ID0gYzEgKiBzMiAqIGMzICsgczEgKiBjMiAqIHMzO1xuXHRcdFx0XHR0aGlzLl96ID0gYzEgKiBjMiAqIHMzICsgczEgKiBzMiAqIGMzO1xuXHRcdFx0XHR0aGlzLl93ID0gYzEgKiBjMiAqIGMzIC0gczEgKiBzMiAqIHMzO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnWllYJzpcblx0XHRcdFx0dGhpcy5feCA9IHMxICogYzIgKiBjMyAtIGMxICogczIgKiBzMztcblx0XHRcdFx0dGhpcy5feSA9IGMxICogczIgKiBjMyArIHMxICogYzIgKiBzMztcblx0XHRcdFx0dGhpcy5feiA9IGMxICogYzIgKiBzMyAtIHMxICogczIgKiBjMztcblx0XHRcdFx0dGhpcy5fdyA9IGMxICogYzIgKiBjMyArIHMxICogczIgKiBzMztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ1laWCc6XG5cdFx0XHRcdHRoaXMuX3ggPSBzMSAqIGMyICogYzMgKyBjMSAqIHMyICogczM7XG5cdFx0XHRcdHRoaXMuX3kgPSBjMSAqIHMyICogYzMgKyBzMSAqIGMyICogczM7XG5cdFx0XHRcdHRoaXMuX3ogPSBjMSAqIGMyICogczMgLSBzMSAqIHMyICogYzM7XG5cdFx0XHRcdHRoaXMuX3cgPSBjMSAqIGMyICogYzMgLSBzMSAqIHMyICogczM7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdYWlknOlxuXHRcdFx0XHR0aGlzLl94ID0gczEgKiBjMiAqIGMzIC0gYzEgKiBzMiAqIHMzO1xuXHRcdFx0XHR0aGlzLl95ID0gYzEgKiBzMiAqIGMzIC0gczEgKiBjMiAqIHMzO1xuXHRcdFx0XHR0aGlzLl96ID0gYzEgKiBjMiAqIHMzICsgczEgKiBzMiAqIGMzO1xuXHRcdFx0XHR0aGlzLl93ID0gYzEgKiBjMiAqIGMzICsgczEgKiBzMiAqIHMzO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuUXVhdGVybmlvbjogLnNldEZyb21FdWxlcigpIGVuY291bnRlcmVkIGFuIHVua25vd24gb3JkZXI6ICcgKyBvcmRlciApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB1cGRhdGUgIT09IGZhbHNlICkgdGhpcy5fb25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21BeGlzQW5nbGUoIGF4aXMsIGFuZ2xlICkge1xuXG5cdFx0Ly8gaHR0cDovL3d3dy5ldWNsaWRlYW5zcGFjZS5jb20vbWF0aHMvZ2VvbWV0cnkvcm90YXRpb25zL2NvbnZlcnNpb25zL2FuZ2xlVG9RdWF0ZXJuaW9uL2luZGV4Lmh0bVxuXG5cdFx0Ly8gYXNzdW1lcyBheGlzIGlzIG5vcm1hbGl6ZWRcblxuXHRcdGNvbnN0IGhhbGZBbmdsZSA9IGFuZ2xlIC8gMiwgcyA9IE1hdGguc2luKCBoYWxmQW5nbGUgKTtcblxuXHRcdHRoaXMuX3ggPSBheGlzLnggKiBzO1xuXHRcdHRoaXMuX3kgPSBheGlzLnkgKiBzO1xuXHRcdHRoaXMuX3ogPSBheGlzLnogKiBzO1xuXHRcdHRoaXMuX3cgPSBNYXRoLmNvcyggaGFsZkFuZ2xlICk7XG5cblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0RnJvbVJvdGF0aW9uTWF0cml4KCBtICkge1xuXG5cdFx0Ly8gaHR0cDovL3d3dy5ldWNsaWRlYW5zcGFjZS5jb20vbWF0aHMvZ2VvbWV0cnkvcm90YXRpb25zL2NvbnZlcnNpb25zL21hdHJpeFRvUXVhdGVybmlvbi9pbmRleC5odG1cblxuXHRcdC8vIGFzc3VtZXMgdGhlIHVwcGVyIDN4MyBvZiBtIGlzIGEgcHVyZSByb3RhdGlvbiBtYXRyaXggKGkuZSwgdW5zY2FsZWQpXG5cblx0XHRjb25zdCB0ZSA9IG0uZWxlbWVudHMsXG5cblx0XHRcdG0xMSA9IHRlWyAwIF0sIG0xMiA9IHRlWyA0IF0sIG0xMyA9IHRlWyA4IF0sXG5cdFx0XHRtMjEgPSB0ZVsgMSBdLCBtMjIgPSB0ZVsgNSBdLCBtMjMgPSB0ZVsgOSBdLFxuXHRcdFx0bTMxID0gdGVbIDIgXSwgbTMyID0gdGVbIDYgXSwgbTMzID0gdGVbIDEwIF0sXG5cblx0XHRcdHRyYWNlID0gbTExICsgbTIyICsgbTMzO1xuXG5cdFx0aWYgKCB0cmFjZSA+IDAgKSB7XG5cblx0XHRcdGNvbnN0IHMgPSAwLjUgLyBNYXRoLnNxcnQoIHRyYWNlICsgMS4wICk7XG5cblx0XHRcdHRoaXMuX3cgPSAwLjI1IC8gcztcblx0XHRcdHRoaXMuX3ggPSAoIG0zMiAtIG0yMyApICogcztcblx0XHRcdHRoaXMuX3kgPSAoIG0xMyAtIG0zMSApICogcztcblx0XHRcdHRoaXMuX3ogPSAoIG0yMSAtIG0xMiApICogcztcblxuXHRcdH0gZWxzZSBpZiAoIG0xMSA+IG0yMiAmJiBtMTEgPiBtMzMgKSB7XG5cblx0XHRcdGNvbnN0IHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIG0xMSAtIG0yMiAtIG0zMyApO1xuXG5cdFx0XHR0aGlzLl93ID0gKCBtMzIgLSBtMjMgKSAvIHM7XG5cdFx0XHR0aGlzLl94ID0gMC4yNSAqIHM7XG5cdFx0XHR0aGlzLl95ID0gKCBtMTIgKyBtMjEgKSAvIHM7XG5cdFx0XHR0aGlzLl96ID0gKCBtMTMgKyBtMzEgKSAvIHM7XG5cblx0XHR9IGVsc2UgaWYgKCBtMjIgPiBtMzMgKSB7XG5cblx0XHRcdGNvbnN0IHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIG0yMiAtIG0xMSAtIG0zMyApO1xuXG5cdFx0XHR0aGlzLl93ID0gKCBtMTMgLSBtMzEgKSAvIHM7XG5cdFx0XHR0aGlzLl94ID0gKCBtMTIgKyBtMjEgKSAvIHM7XG5cdFx0XHR0aGlzLl95ID0gMC4yNSAqIHM7XG5cdFx0XHR0aGlzLl96ID0gKCBtMjMgKyBtMzIgKSAvIHM7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRjb25zdCBzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMzMgLSBtMTEgLSBtMjIgKTtcblxuXHRcdFx0dGhpcy5fdyA9ICggbTIxIC0gbTEyICkgLyBzO1xuXHRcdFx0dGhpcy5feCA9ICggbTEzICsgbTMxICkgLyBzO1xuXHRcdFx0dGhpcy5feSA9ICggbTIzICsgbTMyICkgLyBzO1xuXHRcdFx0dGhpcy5feiA9IDAuMjUgKiBzO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5fb25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21Vbml0VmVjdG9ycyggdkZyb20sIHZUbyApIHtcblxuXHRcdC8vIGFzc3VtZXMgZGlyZWN0aW9uIHZlY3RvcnMgdkZyb20gYW5kIHZUbyBhcmUgbm9ybWFsaXplZFxuXG5cdFx0bGV0IHIgPSB2RnJvbS5kb3QoIHZUbyApICsgMTtcblxuXHRcdGlmICggciA8IE51bWJlci5FUFNJTE9OICkge1xuXG5cdFx0XHQvLyB2RnJvbSBhbmQgdlRvIHBvaW50IGluIG9wcG9zaXRlIGRpcmVjdGlvbnNcblxuXHRcdFx0ciA9IDA7XG5cblx0XHRcdGlmICggTWF0aC5hYnMoIHZGcm9tLnggKSA+IE1hdGguYWJzKCB2RnJvbS56ICkgKSB7XG5cblx0XHRcdFx0dGhpcy5feCA9IC0gdkZyb20ueTtcblx0XHRcdFx0dGhpcy5feSA9IHZGcm9tLng7XG5cdFx0XHRcdHRoaXMuX3ogPSAwO1xuXHRcdFx0XHR0aGlzLl93ID0gcjtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHR0aGlzLl94ID0gMDtcblx0XHRcdFx0dGhpcy5feSA9IC0gdkZyb20uejtcblx0XHRcdFx0dGhpcy5feiA9IHZGcm9tLnk7XG5cdFx0XHRcdHRoaXMuX3cgPSByO1xuXG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBjcm9zc1ZlY3RvcnMoIHZGcm9tLCB2VG8gKTsgLy8gaW5saW5lZCB0byBhdm9pZCBjeWNsaWMgZGVwZW5kZW5jeSBvbiBWZWN0b3IzXG5cblx0XHRcdHRoaXMuX3ggPSB2RnJvbS55ICogdlRvLnogLSB2RnJvbS56ICogdlRvLnk7XG5cdFx0XHR0aGlzLl95ID0gdkZyb20ueiAqIHZUby54IC0gdkZyb20ueCAqIHZUby56O1xuXHRcdFx0dGhpcy5feiA9IHZGcm9tLnggKiB2VG8ueSAtIHZGcm9tLnkgKiB2VG8ueDtcblx0XHRcdHRoaXMuX3cgPSByO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMubm9ybWFsaXplKCk7XG5cblx0fVxuXG5cdGFuZ2xlVG8oIHEgKSB7XG5cblx0XHRyZXR1cm4gMiAqIE1hdGguYWNvcyggTWF0aC5hYnMoIE1hdGhVdGlscy5jbGFtcCggdGhpcy5kb3QoIHEgKSwgLSAxLCAxICkgKSApO1xuXG5cdH1cblxuXHRyb3RhdGVUb3dhcmRzKCBxLCBzdGVwICkge1xuXG5cdFx0Y29uc3QgYW5nbGUgPSB0aGlzLmFuZ2xlVG8oIHEgKTtcblxuXHRcdGlmICggYW5nbGUgPT09IDAgKSByZXR1cm4gdGhpcztcblxuXHRcdGNvbnN0IHQgPSBNYXRoLm1pbiggMSwgc3RlcCAvIGFuZ2xlICk7XG5cblx0XHR0aGlzLnNsZXJwKCBxLCB0ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0aWRlbnRpdHkoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5zZXQoIDAsIDAsIDAsIDEgKTtcblxuXHR9XG5cblx0aW52ZXJ0KCkge1xuXG5cdFx0Ly8gcXVhdGVybmlvbiBpcyBhc3N1bWVkIHRvIGhhdmUgdW5pdCBsZW5ndGhcblxuXHRcdHJldHVybiB0aGlzLmNvbmp1Z2F0ZSgpO1xuXG5cdH1cblxuXHRjb25qdWdhdGUoKSB7XG5cblx0XHR0aGlzLl94ICo9IC0gMTtcblx0XHR0aGlzLl95ICo9IC0gMTtcblx0XHR0aGlzLl96ICo9IC0gMTtcblxuXHRcdHRoaXMuX29uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRkb3QoIHYgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5feCAqIHYuX3ggKyB0aGlzLl95ICogdi5feSArIHRoaXMuX3ogKiB2Ll96ICsgdGhpcy5fdyAqIHYuX3c7XG5cblx0fVxuXG5cdGxlbmd0aFNxKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuX3ggKiB0aGlzLl94ICsgdGhpcy5feSAqIHRoaXMuX3kgKyB0aGlzLl96ICogdGhpcy5feiArIHRoaXMuX3cgKiB0aGlzLl93O1xuXG5cdH1cblxuXHRsZW5ndGgoKSB7XG5cblx0XHRyZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLl94ICogdGhpcy5feCArIHRoaXMuX3kgKiB0aGlzLl95ICsgdGhpcy5feiAqIHRoaXMuX3ogKyB0aGlzLl93ICogdGhpcy5fdyApO1xuXG5cdH1cblxuXHRub3JtYWxpemUoKSB7XG5cblx0XHRsZXQgbCA9IHRoaXMubGVuZ3RoKCk7XG5cblx0XHRpZiAoIGwgPT09IDAgKSB7XG5cblx0XHRcdHRoaXMuX3ggPSAwO1xuXHRcdFx0dGhpcy5feSA9IDA7XG5cdFx0XHR0aGlzLl96ID0gMDtcblx0XHRcdHRoaXMuX3cgPSAxO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0bCA9IDEgLyBsO1xuXG5cdFx0XHR0aGlzLl94ID0gdGhpcy5feCAqIGw7XG5cdFx0XHR0aGlzLl95ID0gdGhpcy5feSAqIGw7XG5cdFx0XHR0aGlzLl96ID0gdGhpcy5feiAqIGw7XG5cdFx0XHR0aGlzLl93ID0gdGhpcy5fdyAqIGw7XG5cblx0XHR9XG5cblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bXVsdGlwbHkoIHEgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseVF1YXRlcm5pb25zKCB0aGlzLCBxICk7XG5cblx0fVxuXG5cdHByZW11bHRpcGx5KCBxICkge1xuXG5cdFx0cmV0dXJuIHRoaXMubXVsdGlwbHlRdWF0ZXJuaW9ucyggcSwgdGhpcyApO1xuXG5cdH1cblxuXHRtdWx0aXBseVF1YXRlcm5pb25zKCBhLCBiICkge1xuXG5cdFx0Ly8gZnJvbSBodHRwOi8vd3d3LmV1Y2xpZGVhbnNwYWNlLmNvbS9tYXRocy9hbGdlYnJhL3JlYWxOb3JtZWRBbGdlYnJhL3F1YXRlcm5pb25zL2NvZGUvaW5kZXguaHRtXG5cblx0XHRjb25zdCBxYXggPSBhLl94LCBxYXkgPSBhLl95LCBxYXogPSBhLl96LCBxYXcgPSBhLl93O1xuXHRcdGNvbnN0IHFieCA9IGIuX3gsIHFieSA9IGIuX3ksIHFieiA9IGIuX3osIHFidyA9IGIuX3c7XG5cblx0XHR0aGlzLl94ID0gcWF4ICogcWJ3ICsgcWF3ICogcWJ4ICsgcWF5ICogcWJ6IC0gcWF6ICogcWJ5O1xuXHRcdHRoaXMuX3kgPSBxYXkgKiBxYncgKyBxYXcgKiBxYnkgKyBxYXogKiBxYnggLSBxYXggKiBxYno7XG5cdFx0dGhpcy5feiA9IHFheiAqIHFidyArIHFhdyAqIHFieiArIHFheCAqIHFieSAtIHFheSAqIHFieDtcblx0XHR0aGlzLl93ID0gcWF3ICogcWJ3IC0gcWF4ICogcWJ4IC0gcWF5ICogcWJ5IC0gcWF6ICogcWJ6O1xuXG5cdFx0dGhpcy5fb25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNsZXJwKCBxYiwgdCApIHtcblxuXHRcdGlmICggdCA9PT0gMCApIHJldHVybiB0aGlzO1xuXHRcdGlmICggdCA9PT0gMSApIHJldHVybiB0aGlzLmNvcHkoIHFiICk7XG5cblx0XHRjb25zdCB4ID0gdGhpcy5feCwgeSA9IHRoaXMuX3ksIHogPSB0aGlzLl96LCB3ID0gdGhpcy5fdztcblxuXHRcdC8vIGh0dHA6Ly93d3cuZXVjbGlkZWFuc3BhY2UuY29tL21hdGhzL2FsZ2VicmEvcmVhbE5vcm1lZEFsZ2VicmEvcXVhdGVybmlvbnMvc2xlcnAvXG5cblx0XHRsZXQgY29zSGFsZlRoZXRhID0gdyAqIHFiLl93ICsgeCAqIHFiLl94ICsgeSAqIHFiLl95ICsgeiAqIHFiLl96O1xuXG5cdFx0aWYgKCBjb3NIYWxmVGhldGEgPCAwICkge1xuXG5cdFx0XHR0aGlzLl93ID0gLSBxYi5fdztcblx0XHRcdHRoaXMuX3ggPSAtIHFiLl94O1xuXHRcdFx0dGhpcy5feSA9IC0gcWIuX3k7XG5cdFx0XHR0aGlzLl96ID0gLSBxYi5fejtcblxuXHRcdFx0Y29zSGFsZlRoZXRhID0gLSBjb3NIYWxmVGhldGE7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR0aGlzLmNvcHkoIHFiICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIGNvc0hhbGZUaGV0YSA+PSAxLjAgKSB7XG5cblx0XHRcdHRoaXMuX3cgPSB3O1xuXHRcdFx0dGhpcy5feCA9IHg7XG5cdFx0XHR0aGlzLl95ID0geTtcblx0XHRcdHRoaXMuX3ogPSB6O1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblxuXHRcdH1cblxuXHRcdGNvbnN0IHNxclNpbkhhbGZUaGV0YSA9IDEuMCAtIGNvc0hhbGZUaGV0YSAqIGNvc0hhbGZUaGV0YTtcblxuXHRcdGlmICggc3FyU2luSGFsZlRoZXRhIDw9IE51bWJlci5FUFNJTE9OICkge1xuXG5cdFx0XHRjb25zdCBzID0gMSAtIHQ7XG5cdFx0XHR0aGlzLl93ID0gcyAqIHcgKyB0ICogdGhpcy5fdztcblx0XHRcdHRoaXMuX3ggPSBzICogeCArIHQgKiB0aGlzLl94O1xuXHRcdFx0dGhpcy5feSA9IHMgKiB5ICsgdCAqIHRoaXMuX3k7XG5cdFx0XHR0aGlzLl96ID0gcyAqIHogKyB0ICogdGhpcy5fejtcblxuXHRcdFx0dGhpcy5ub3JtYWxpemUoKTtcblx0XHRcdHRoaXMuX29uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHR9XG5cblx0XHRjb25zdCBzaW5IYWxmVGhldGEgPSBNYXRoLnNxcnQoIHNxclNpbkhhbGZUaGV0YSApO1xuXHRcdGNvbnN0IGhhbGZUaGV0YSA9IE1hdGguYXRhbjIoIHNpbkhhbGZUaGV0YSwgY29zSGFsZlRoZXRhICk7XG5cdFx0Y29uc3QgcmF0aW9BID0gTWF0aC5zaW4oICggMSAtIHQgKSAqIGhhbGZUaGV0YSApIC8gc2luSGFsZlRoZXRhLFxuXHRcdFx0cmF0aW9CID0gTWF0aC5zaW4oIHQgKiBoYWxmVGhldGEgKSAvIHNpbkhhbGZUaGV0YTtcblxuXHRcdHRoaXMuX3cgPSAoIHcgKiByYXRpb0EgKyB0aGlzLl93ICogcmF0aW9CICk7XG5cdFx0dGhpcy5feCA9ICggeCAqIHJhdGlvQSArIHRoaXMuX3ggKiByYXRpb0IgKTtcblx0XHR0aGlzLl95ID0gKCB5ICogcmF0aW9BICsgdGhpcy5feSAqIHJhdGlvQiApO1xuXHRcdHRoaXMuX3ogPSAoIHogKiByYXRpb0EgKyB0aGlzLl96ICogcmF0aW9CICk7XG5cblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2xlcnBRdWF0ZXJuaW9ucyggcWEsIHFiLCB0ICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuY29weSggcWEgKS5zbGVycCggcWIsIHQgKTtcblxuXHR9XG5cblx0cmFuZG9tKCkge1xuXG5cdFx0Ly8gRGVyaXZlZCBmcm9tIGh0dHA6Ly9wbGFubmluZy5jcy51aXVjLmVkdS9ub2RlMTk4Lmh0bWxcblx0XHQvLyBOb3RlLCB0aGlzIHNvdXJjZSB1c2VzIHcsIHgsIHksIHogb3JkZXJpbmcsXG5cdFx0Ly8gc28gd2Ugc3dhcCB0aGUgb3JkZXIgYmVsb3cuXG5cblx0XHRjb25zdCB1MSA9IE1hdGgucmFuZG9tKCk7XG5cdFx0Y29uc3Qgc3FydDF1MSA9IE1hdGguc3FydCggMSAtIHUxICk7XG5cdFx0Y29uc3Qgc3FydHUxID0gTWF0aC5zcXJ0KCB1MSApO1xuXG5cdFx0Y29uc3QgdTIgPSAyICogTWF0aC5QSSAqIE1hdGgucmFuZG9tKCk7XG5cblx0XHRjb25zdCB1MyA9IDIgKiBNYXRoLlBJICogTWF0aC5yYW5kb20oKTtcblxuXHRcdHJldHVybiB0aGlzLnNldChcblx0XHRcdHNxcnQxdTEgKiBNYXRoLmNvcyggdTIgKSxcblx0XHRcdHNxcnR1MSAqIE1hdGguc2luKCB1MyApLFxuXHRcdFx0c3FydHUxICogTWF0aC5jb3MoIHUzICksXG5cdFx0XHRzcXJ0MXUxICogTWF0aC5zaW4oIHUyICksXG5cdFx0KTtcblxuXHR9XG5cblx0ZXF1YWxzKCBxdWF0ZXJuaW9uICkge1xuXG5cdFx0cmV0dXJuICggcXVhdGVybmlvbi5feCA9PT0gdGhpcy5feCApICYmICggcXVhdGVybmlvbi5feSA9PT0gdGhpcy5feSApICYmICggcXVhdGVybmlvbi5feiA9PT0gdGhpcy5feiApICYmICggcXVhdGVybmlvbi5fdyA9PT0gdGhpcy5fdyApO1xuXG5cdH1cblxuXHRmcm9tQXJyYXkoIGFycmF5LCBvZmZzZXQgPSAwICkge1xuXG5cdFx0dGhpcy5feCA9IGFycmF5WyBvZmZzZXQgXTtcblx0XHR0aGlzLl95ID0gYXJyYXlbIG9mZnNldCArIDEgXTtcblx0XHR0aGlzLl96ID0gYXJyYXlbIG9mZnNldCArIDIgXTtcblx0XHR0aGlzLl93ID0gYXJyYXlbIG9mZnNldCArIDMgXTtcblxuXHRcdHRoaXMuX29uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR0b0FycmF5KCBhcnJheSA9IFtdLCBvZmZzZXQgPSAwICkge1xuXG5cdFx0YXJyYXlbIG9mZnNldCBdID0gdGhpcy5feDtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMSBdID0gdGhpcy5feTtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMiBdID0gdGhpcy5fejtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMyBdID0gdGhpcy5fdztcblxuXHRcdHJldHVybiBhcnJheTtcblxuXHR9XG5cblx0ZnJvbUJ1ZmZlckF0dHJpYnV0ZSggYXR0cmlidXRlLCBpbmRleCApIHtcblxuXHRcdHRoaXMuX3ggPSBhdHRyaWJ1dGUuZ2V0WCggaW5kZXggKTtcblx0XHR0aGlzLl95ID0gYXR0cmlidXRlLmdldFkoIGluZGV4ICk7XG5cdFx0dGhpcy5feiA9IGF0dHJpYnV0ZS5nZXRaKCBpbmRleCApO1xuXHRcdHRoaXMuX3cgPSBhdHRyaWJ1dGUuZ2V0VyggaW5kZXggKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR0b0pTT04oKSB7XG5cblx0XHRyZXR1cm4gdGhpcy50b0FycmF5KCk7XG5cblx0fVxuXG5cdF9vbkNoYW5nZSggY2FsbGJhY2sgKSB7XG5cblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrID0gY2FsbGJhY2s7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0X29uQ2hhbmdlQ2FsbGJhY2soKSB7fVxuXG5cdCpbIFN5bWJvbC5pdGVyYXRvciBdKCkge1xuXG5cdFx0eWllbGQgdGhpcy5feDtcblx0XHR5aWVsZCB0aGlzLl95O1xuXHRcdHlpZWxkIHRoaXMuX3o7XG5cdFx0eWllbGQgdGhpcy5fdztcblxuXHR9XG5cbn1cblxuZXhwb3J0IHsgUXVhdGVybmlvbiB9O1xuIiwiaW1wb3J0ICogYXMgTWF0aFV0aWxzIGZyb20gJy4vTWF0aFV0aWxzLmpzJztcbmltcG9ydCB7IFF1YXRlcm5pb24gfSBmcm9tICcuL1F1YXRlcm5pb24uanMnO1xuXG5jbGFzcyBWZWN0b3IzIHtcblxuXHRjb25zdHJ1Y3RvciggeCA9IDAsIHkgPSAwLCB6ID0gMCApIHtcblxuXHRcdFZlY3RvcjMucHJvdG90eXBlLmlzVmVjdG9yMyA9IHRydWU7XG5cblx0XHR0aGlzLnggPSB4O1xuXHRcdHRoaXMueSA9IHk7XG5cdFx0dGhpcy56ID0gejtcblxuXHR9XG5cblx0c2V0KCB4LCB5LCB6ICkge1xuXG5cdFx0aWYgKCB6ID09PSB1bmRlZmluZWQgKSB6ID0gdGhpcy56OyAvLyBzcHJpdGUuc2NhbGUuc2V0KHgseSlcblxuXHRcdHRoaXMueCA9IHg7XG5cdFx0dGhpcy55ID0geTtcblx0XHR0aGlzLnogPSB6O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldFNjYWxhciggc2NhbGFyICkge1xuXG5cdFx0dGhpcy54ID0gc2NhbGFyO1xuXHRcdHRoaXMueSA9IHNjYWxhcjtcblx0XHR0aGlzLnogPSBzY2FsYXI7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0WCggeCApIHtcblxuXHRcdHRoaXMueCA9IHg7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0WSggeSApIHtcblxuXHRcdHRoaXMueSA9IHk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0WiggeiApIHtcblxuXHRcdHRoaXMueiA9IHo7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0Q29tcG9uZW50KCBpbmRleCwgdmFsdWUgKSB7XG5cblx0XHRzd2l0Y2ggKCBpbmRleCApIHtcblxuXHRcdFx0Y2FzZSAwOiB0aGlzLnggPSB2YWx1ZTsgYnJlYWs7XG5cdFx0XHRjYXNlIDE6IHRoaXMueSA9IHZhbHVlOyBicmVhaztcblx0XHRcdGNhc2UgMjogdGhpcy56ID0gdmFsdWU7IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCAnaW5kZXggaXMgb3V0IG9mIHJhbmdlOiAnICsgaW5kZXggKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRnZXRDb21wb25lbnQoIGluZGV4ICkge1xuXG5cdFx0c3dpdGNoICggaW5kZXggKSB7XG5cblx0XHRcdGNhc2UgMDogcmV0dXJuIHRoaXMueDtcblx0XHRcdGNhc2UgMTogcmV0dXJuIHRoaXMueTtcblx0XHRcdGNhc2UgMjogcmV0dXJuIHRoaXMuejtcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvciggJ2luZGV4IGlzIG91dCBvZiByYW5nZTogJyArIGluZGV4ICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdGNsb25lKCkge1xuXG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCB0aGlzLngsIHRoaXMueSwgdGhpcy56ICk7XG5cblx0fVxuXG5cdGNvcHkoIHYgKSB7XG5cblx0XHR0aGlzLnggPSB2Lng7XG5cdFx0dGhpcy55ID0gdi55O1xuXHRcdHRoaXMueiA9IHYuejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhZGQoIHYgKSB7XG5cblx0XHR0aGlzLnggKz0gdi54O1xuXHRcdHRoaXMueSArPSB2Lnk7XG5cdFx0dGhpcy56ICs9IHYuejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhZGRTY2FsYXIoIHMgKSB7XG5cblx0XHR0aGlzLnggKz0gcztcblx0XHR0aGlzLnkgKz0gcztcblx0XHR0aGlzLnogKz0gcztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhZGRWZWN0b3JzKCBhLCBiICkge1xuXG5cdFx0dGhpcy54ID0gYS54ICsgYi54O1xuXHRcdHRoaXMueSA9IGEueSArIGIueTtcblx0XHR0aGlzLnogPSBhLnogKyBiLno7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0YWRkU2NhbGVkVmVjdG9yKCB2LCBzICkge1xuXG5cdFx0dGhpcy54ICs9IHYueCAqIHM7XG5cdFx0dGhpcy55ICs9IHYueSAqIHM7XG5cdFx0dGhpcy56ICs9IHYueiAqIHM7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c3ViKCB2ICkge1xuXG5cdFx0dGhpcy54IC09IHYueDtcblx0XHR0aGlzLnkgLT0gdi55O1xuXHRcdHRoaXMueiAtPSB2Lno7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c3ViU2NhbGFyKCBzICkge1xuXG5cdFx0dGhpcy54IC09IHM7XG5cdFx0dGhpcy55IC09IHM7XG5cdFx0dGhpcy56IC09IHM7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c3ViVmVjdG9ycyggYSwgYiApIHtcblxuXHRcdHRoaXMueCA9IGEueCAtIGIueDtcblx0XHR0aGlzLnkgPSBhLnkgLSBiLnk7XG5cdFx0dGhpcy56ID0gYS56IC0gYi56O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG11bHRpcGx5KCB2ICkge1xuXG5cdFx0dGhpcy54ICo9IHYueDtcblx0XHR0aGlzLnkgKj0gdi55O1xuXHRcdHRoaXMueiAqPSB2Lno7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bXVsdGlwbHlTY2FsYXIoIHNjYWxhciApIHtcblxuXHRcdHRoaXMueCAqPSBzY2FsYXI7XG5cdFx0dGhpcy55ICo9IHNjYWxhcjtcblx0XHR0aGlzLnogKj0gc2NhbGFyO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG11bHRpcGx5VmVjdG9ycyggYSwgYiApIHtcblxuXHRcdHRoaXMueCA9IGEueCAqIGIueDtcblx0XHR0aGlzLnkgPSBhLnkgKiBiLnk7XG5cdFx0dGhpcy56ID0gYS56ICogYi56O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGFwcGx5RXVsZXIoIGV1bGVyICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwbHlRdWF0ZXJuaW9uKCBfcXVhdGVybmlvbi5zZXRGcm9tRXVsZXIoIGV1bGVyICkgKTtcblxuXHR9XG5cblx0YXBwbHlBeGlzQW5nbGUoIGF4aXMsIGFuZ2xlICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwbHlRdWF0ZXJuaW9uKCBfcXVhdGVybmlvbi5zZXRGcm9tQXhpc0FuZ2xlKCBheGlzLCBhbmdsZSApICk7XG5cblx0fVxuXG5cdGFwcGx5TWF0cml4MyggbSApIHtcblxuXHRcdGNvbnN0IHggPSB0aGlzLngsIHkgPSB0aGlzLnksIHogPSB0aGlzLno7XG5cdFx0Y29uc3QgZSA9IG0uZWxlbWVudHM7XG5cblx0XHR0aGlzLnggPSBlWyAwIF0gKiB4ICsgZVsgMyBdICogeSArIGVbIDYgXSAqIHo7XG5cdFx0dGhpcy55ID0gZVsgMSBdICogeCArIGVbIDQgXSAqIHkgKyBlWyA3IF0gKiB6O1xuXHRcdHRoaXMueiA9IGVbIDIgXSAqIHggKyBlWyA1IF0gKiB5ICsgZVsgOCBdICogejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhcHBseU5vcm1hbE1hdHJpeCggbSApIHtcblxuXHRcdHJldHVybiB0aGlzLmFwcGx5TWF0cml4MyggbSApLm5vcm1hbGl6ZSgpO1xuXG5cdH1cblxuXHRhcHBseU1hdHJpeDQoIG0gKSB7XG5cblx0XHRjb25zdCB4ID0gdGhpcy54LCB5ID0gdGhpcy55LCB6ID0gdGhpcy56O1xuXHRcdGNvbnN0IGUgPSBtLmVsZW1lbnRzO1xuXG5cdFx0Y29uc3QgdyA9IDEgLyAoIGVbIDMgXSAqIHggKyBlWyA3IF0gKiB5ICsgZVsgMTEgXSAqIHogKyBlWyAxNSBdICk7XG5cblx0XHR0aGlzLnggPSAoIGVbIDAgXSAqIHggKyBlWyA0IF0gKiB5ICsgZVsgOCBdICogeiArIGVbIDEyIF0gKSAqIHc7XG5cdFx0dGhpcy55ID0gKCBlWyAxIF0gKiB4ICsgZVsgNSBdICogeSArIGVbIDkgXSAqIHogKyBlWyAxMyBdICkgKiB3O1xuXHRcdHRoaXMueiA9ICggZVsgMiBdICogeCArIGVbIDYgXSAqIHkgKyBlWyAxMCBdICogeiArIGVbIDE0IF0gKSAqIHc7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0YXBwbHlRdWF0ZXJuaW9uKCBxICkge1xuXG5cdFx0Y29uc3QgeCA9IHRoaXMueCwgeSA9IHRoaXMueSwgeiA9IHRoaXMuejtcblx0XHRjb25zdCBxeCA9IHEueCwgcXkgPSBxLnksIHF6ID0gcS56LCBxdyA9IHEudztcblxuXHRcdC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjdG9yXG5cblx0XHRjb25zdCBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeTtcblx0XHRjb25zdCBpeSA9IHF3ICogeSArIHF6ICogeCAtIHF4ICogejtcblx0XHRjb25zdCBpeiA9IHF3ICogeiArIHF4ICogeSAtIHF5ICogeDtcblx0XHRjb25zdCBpdyA9IC0gcXggKiB4IC0gcXkgKiB5IC0gcXogKiB6O1xuXG5cdFx0Ly8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuXG5cdFx0dGhpcy54ID0gaXggKiBxdyArIGl3ICogLSBxeCArIGl5ICogLSBxeiAtIGl6ICogLSBxeTtcblx0XHR0aGlzLnkgPSBpeSAqIHF3ICsgaXcgKiAtIHF5ICsgaXogKiAtIHF4IC0gaXggKiAtIHF6O1xuXHRcdHRoaXMueiA9IGl6ICogcXcgKyBpdyAqIC0gcXogKyBpeCAqIC0gcXkgLSBpeSAqIC0gcXg7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0cHJvamVjdCggY2FtZXJhICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwbHlNYXRyaXg0KCBjYW1lcmEubWF0cml4V29ybGRJbnZlcnNlICkuYXBwbHlNYXRyaXg0KCBjYW1lcmEucHJvamVjdGlvbk1hdHJpeCApO1xuXG5cdH1cblxuXHR1bnByb2plY3QoIGNhbWVyYSApIHtcblxuXHRcdHJldHVybiB0aGlzLmFwcGx5TWF0cml4NCggY2FtZXJhLnByb2plY3Rpb25NYXRyaXhJbnZlcnNlICkuYXBwbHlNYXRyaXg0KCBjYW1lcmEubWF0cml4V29ybGQgKTtcblxuXHR9XG5cblx0dHJhbnNmb3JtRGlyZWN0aW9uKCBtICkge1xuXG5cdFx0Ly8gaW5wdXQ6IFRIUkVFLk1hdHJpeDQgYWZmaW5lIG1hdHJpeFxuXHRcdC8vIHZlY3RvciBpbnRlcnByZXRlZCBhcyBhIGRpcmVjdGlvblxuXG5cdFx0Y29uc3QgeCA9IHRoaXMueCwgeSA9IHRoaXMueSwgeiA9IHRoaXMuejtcblx0XHRjb25zdCBlID0gbS5lbGVtZW50cztcblxuXHRcdHRoaXMueCA9IGVbIDAgXSAqIHggKyBlWyA0IF0gKiB5ICsgZVsgOCBdICogejtcblx0XHR0aGlzLnkgPSBlWyAxIF0gKiB4ICsgZVsgNSBdICogeSArIGVbIDkgXSAqIHo7XG5cdFx0dGhpcy56ID0gZVsgMiBdICogeCArIGVbIDYgXSAqIHkgKyBlWyAxMCBdICogejtcblxuXHRcdHJldHVybiB0aGlzLm5vcm1hbGl6ZSgpO1xuXG5cdH1cblxuXHRkaXZpZGUoIHYgKSB7XG5cblx0XHR0aGlzLnggLz0gdi54O1xuXHRcdHRoaXMueSAvPSB2Lnk7XG5cdFx0dGhpcy56IC89IHYuejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRkaXZpZGVTY2FsYXIoIHNjYWxhciApIHtcblxuXHRcdHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKCAxIC8gc2NhbGFyICk7XG5cblx0fVxuXG5cdG1pbiggdiApIHtcblxuXHRcdHRoaXMueCA9IE1hdGgubWluKCB0aGlzLngsIHYueCApO1xuXHRcdHRoaXMueSA9IE1hdGgubWluKCB0aGlzLnksIHYueSApO1xuXHRcdHRoaXMueiA9IE1hdGgubWluKCB0aGlzLnosIHYueiApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG1heCggdiApIHtcblxuXHRcdHRoaXMueCA9IE1hdGgubWF4KCB0aGlzLngsIHYueCApO1xuXHRcdHRoaXMueSA9IE1hdGgubWF4KCB0aGlzLnksIHYueSApO1xuXHRcdHRoaXMueiA9IE1hdGgubWF4KCB0aGlzLnosIHYueiApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNsYW1wKCBtaW4sIG1heCApIHtcblxuXHRcdC8vIGFzc3VtZXMgbWluIDwgbWF4LCBjb21wb25lbnR3aXNlXG5cblx0XHR0aGlzLnggPSBNYXRoLm1heCggbWluLngsIE1hdGgubWluKCBtYXgueCwgdGhpcy54ICkgKTtcblx0XHR0aGlzLnkgPSBNYXRoLm1heCggbWluLnksIE1hdGgubWluKCBtYXgueSwgdGhpcy55ICkgKTtcblx0XHR0aGlzLnogPSBNYXRoLm1heCggbWluLnosIE1hdGgubWluKCBtYXgueiwgdGhpcy56ICkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjbGFtcFNjYWxhciggbWluVmFsLCBtYXhWYWwgKSB7XG5cblx0XHR0aGlzLnggPSBNYXRoLm1heCggbWluVmFsLCBNYXRoLm1pbiggbWF4VmFsLCB0aGlzLnggKSApO1xuXHRcdHRoaXMueSA9IE1hdGgubWF4KCBtaW5WYWwsIE1hdGgubWluKCBtYXhWYWwsIHRoaXMueSApICk7XG5cdFx0dGhpcy56ID0gTWF0aC5tYXgoIG1pblZhbCwgTWF0aC5taW4oIG1heFZhbCwgdGhpcy56ICkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjbGFtcExlbmd0aCggbWluLCBtYXggKSB7XG5cblx0XHRjb25zdCBsZW5ndGggPSB0aGlzLmxlbmd0aCgpO1xuXG5cdFx0cmV0dXJuIHRoaXMuZGl2aWRlU2NhbGFyKCBsZW5ndGggfHwgMSApLm11bHRpcGx5U2NhbGFyKCBNYXRoLm1heCggbWluLCBNYXRoLm1pbiggbWF4LCBsZW5ndGggKSApICk7XG5cblx0fVxuXG5cdGZsb29yKCkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5mbG9vciggdGhpcy54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5mbG9vciggdGhpcy55ICk7XG5cdFx0dGhpcy56ID0gTWF0aC5mbG9vciggdGhpcy56ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y2VpbCgpIHtcblxuXHRcdHRoaXMueCA9IE1hdGguY2VpbCggdGhpcy54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5jZWlsKCB0aGlzLnkgKTtcblx0XHR0aGlzLnogPSBNYXRoLmNlaWwoIHRoaXMueiApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHJvdW5kKCkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5yb3VuZCggdGhpcy54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5yb3VuZCggdGhpcy55ICk7XG5cdFx0dGhpcy56ID0gTWF0aC5yb3VuZCggdGhpcy56ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0cm91bmRUb1plcm8oKSB7XG5cblx0XHR0aGlzLnggPSAoIHRoaXMueCA8IDAgKSA/IE1hdGguY2VpbCggdGhpcy54ICkgOiBNYXRoLmZsb29yKCB0aGlzLnggKTtcblx0XHR0aGlzLnkgPSAoIHRoaXMueSA8IDAgKSA/IE1hdGguY2VpbCggdGhpcy55ICkgOiBNYXRoLmZsb29yKCB0aGlzLnkgKTtcblx0XHR0aGlzLnogPSAoIHRoaXMueiA8IDAgKSA/IE1hdGguY2VpbCggdGhpcy56ICkgOiBNYXRoLmZsb29yKCB0aGlzLnogKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRuZWdhdGUoKSB7XG5cblx0XHR0aGlzLnggPSAtIHRoaXMueDtcblx0XHR0aGlzLnkgPSAtIHRoaXMueTtcblx0XHR0aGlzLnogPSAtIHRoaXMuejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRkb3QoIHYgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55ICsgdGhpcy56ICogdi56O1xuXG5cdH1cblxuXHQvLyBUT0RPIGxlbmd0aFNxdWFyZWQ/XG5cblx0bGVuZ3RoU3EoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56O1xuXG5cdH1cblxuXHRsZW5ndGgoKSB7XG5cblx0XHRyZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLnogKTtcblxuXHR9XG5cblx0bWFuaGF0dGFuTGVuZ3RoKCkge1xuXG5cdFx0cmV0dXJuIE1hdGguYWJzKCB0aGlzLnggKSArIE1hdGguYWJzKCB0aGlzLnkgKSArIE1hdGguYWJzKCB0aGlzLnogKTtcblxuXHR9XG5cblx0bm9ybWFsaXplKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuZGl2aWRlU2NhbGFyKCB0aGlzLmxlbmd0aCgpIHx8IDEgKTtcblxuXHR9XG5cblx0c2V0TGVuZ3RoKCBsZW5ndGggKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5ub3JtYWxpemUoKS5tdWx0aXBseVNjYWxhciggbGVuZ3RoICk7XG5cblx0fVxuXG5cdGxlcnAoIHYsIGFscGhhICkge1xuXG5cdFx0dGhpcy54ICs9ICggdi54IC0gdGhpcy54ICkgKiBhbHBoYTtcblx0XHR0aGlzLnkgKz0gKCB2LnkgLSB0aGlzLnkgKSAqIGFscGhhO1xuXHRcdHRoaXMueiArPSAoIHYueiAtIHRoaXMueiApICogYWxwaGE7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bGVycFZlY3RvcnMoIHYxLCB2MiwgYWxwaGEgKSB7XG5cblx0XHR0aGlzLnggPSB2MS54ICsgKCB2Mi54IC0gdjEueCApICogYWxwaGE7XG5cdFx0dGhpcy55ID0gdjEueSArICggdjIueSAtIHYxLnkgKSAqIGFscGhhO1xuXHRcdHRoaXMueiA9IHYxLnogKyAoIHYyLnogLSB2MS56ICkgKiBhbHBoYTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjcm9zcyggdiApIHtcblxuXHRcdHJldHVybiB0aGlzLmNyb3NzVmVjdG9ycyggdGhpcywgdiApO1xuXG5cdH1cblxuXHRjcm9zc1ZlY3RvcnMoIGEsIGIgKSB7XG5cblx0XHRjb25zdCBheCA9IGEueCwgYXkgPSBhLnksIGF6ID0gYS56O1xuXHRcdGNvbnN0IGJ4ID0gYi54LCBieSA9IGIueSwgYnogPSBiLno7XG5cblx0XHR0aGlzLnggPSBheSAqIGJ6IC0gYXogKiBieTtcblx0XHR0aGlzLnkgPSBheiAqIGJ4IC0gYXggKiBiejtcblx0XHR0aGlzLnogPSBheCAqIGJ5IC0gYXkgKiBieDtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRwcm9qZWN0T25WZWN0b3IoIHYgKSB7XG5cblx0XHRjb25zdCBkZW5vbWluYXRvciA9IHYubGVuZ3RoU3EoKTtcblxuXHRcdGlmICggZGVub21pbmF0b3IgPT09IDAgKSByZXR1cm4gdGhpcy5zZXQoIDAsIDAsIDAgKTtcblxuXHRcdGNvbnN0IHNjYWxhciA9IHYuZG90KCB0aGlzICkgLyBkZW5vbWluYXRvcjtcblxuXHRcdHJldHVybiB0aGlzLmNvcHkoIHYgKS5tdWx0aXBseVNjYWxhciggc2NhbGFyICk7XG5cblx0fVxuXG5cdHByb2plY3RPblBsYW5lKCBwbGFuZU5vcm1hbCApIHtcblxuXHRcdF92ZWN0b3IuY29weSggdGhpcyApLnByb2plY3RPblZlY3RvciggcGxhbmVOb3JtYWwgKTtcblxuXHRcdHJldHVybiB0aGlzLnN1YiggX3ZlY3RvciApO1xuXG5cdH1cblxuXHRyZWZsZWN0KCBub3JtYWwgKSB7XG5cblx0XHQvLyByZWZsZWN0IGluY2lkZW50IHZlY3RvciBvZmYgcGxhbmUgb3J0aG9nb25hbCB0byBub3JtYWxcblx0XHQvLyBub3JtYWwgaXMgYXNzdW1lZCB0byBoYXZlIHVuaXQgbGVuZ3RoXG5cblx0XHRyZXR1cm4gdGhpcy5zdWIoIF92ZWN0b3IuY29weSggbm9ybWFsICkubXVsdGlwbHlTY2FsYXIoIDIgKiB0aGlzLmRvdCggbm9ybWFsICkgKSApO1xuXG5cdH1cblxuXHRhbmdsZVRvKCB2ICkge1xuXG5cdFx0Y29uc3QgZGVub21pbmF0b3IgPSBNYXRoLnNxcnQoIHRoaXMubGVuZ3RoU3EoKSAqIHYubGVuZ3RoU3EoKSApO1xuXG5cdFx0aWYgKCBkZW5vbWluYXRvciA9PT0gMCApIHJldHVybiBNYXRoLlBJIC8gMjtcblxuXHRcdGNvbnN0IHRoZXRhID0gdGhpcy5kb3QoIHYgKSAvIGRlbm9taW5hdG9yO1xuXG5cdFx0Ly8gY2xhbXAsIHRvIGhhbmRsZSBudW1lcmljYWwgcHJvYmxlbXNcblxuXHRcdHJldHVybiBNYXRoLmFjb3MoIE1hdGhVdGlscy5jbGFtcCggdGhldGEsIC0gMSwgMSApICk7XG5cblx0fVxuXG5cdGRpc3RhbmNlVG8oIHYgKSB7XG5cblx0XHRyZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLmRpc3RhbmNlVG9TcXVhcmVkKCB2ICkgKTtcblxuXHR9XG5cblx0ZGlzdGFuY2VUb1NxdWFyZWQoIHYgKSB7XG5cblx0XHRjb25zdCBkeCA9IHRoaXMueCAtIHYueCwgZHkgPSB0aGlzLnkgLSB2LnksIGR6ID0gdGhpcy56IC0gdi56O1xuXG5cdFx0cmV0dXJuIGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkejtcblxuXHR9XG5cblx0bWFuaGF0dGFuRGlzdGFuY2VUbyggdiApIHtcblxuXHRcdHJldHVybiBNYXRoLmFicyggdGhpcy54IC0gdi54ICkgKyBNYXRoLmFicyggdGhpcy55IC0gdi55ICkgKyBNYXRoLmFicyggdGhpcy56IC0gdi56ICk7XG5cblx0fVxuXG5cdHNldEZyb21TcGhlcmljYWwoIHMgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5zZXRGcm9tU3BoZXJpY2FsQ29vcmRzKCBzLnJhZGl1cywgcy5waGksIHMudGhldGEgKTtcblxuXHR9XG5cblx0c2V0RnJvbVNwaGVyaWNhbENvb3JkcyggcmFkaXVzLCBwaGksIHRoZXRhICkge1xuXG5cdFx0Y29uc3Qgc2luUGhpUmFkaXVzID0gTWF0aC5zaW4oIHBoaSApICogcmFkaXVzO1xuXG5cdFx0dGhpcy54ID0gc2luUGhpUmFkaXVzICogTWF0aC5zaW4oIHRoZXRhICk7XG5cdFx0dGhpcy55ID0gTWF0aC5jb3MoIHBoaSApICogcmFkaXVzO1xuXHRcdHRoaXMueiA9IHNpblBoaVJhZGl1cyAqIE1hdGguY29zKCB0aGV0YSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21DeWxpbmRyaWNhbCggYyApIHtcblxuXHRcdHJldHVybiB0aGlzLnNldEZyb21DeWxpbmRyaWNhbENvb3JkcyggYy5yYWRpdXMsIGMudGhldGEsIGMueSApO1xuXG5cdH1cblxuXHRzZXRGcm9tQ3lsaW5kcmljYWxDb29yZHMoIHJhZGl1cywgdGhldGEsIHkgKSB7XG5cblx0XHR0aGlzLnggPSByYWRpdXMgKiBNYXRoLnNpbiggdGhldGEgKTtcblx0XHR0aGlzLnkgPSB5O1xuXHRcdHRoaXMueiA9IHJhZGl1cyAqIE1hdGguY29zKCB0aGV0YSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21NYXRyaXhQb3NpdGlvbiggbSApIHtcblxuXHRcdGNvbnN0IGUgPSBtLmVsZW1lbnRzO1xuXG5cdFx0dGhpcy54ID0gZVsgMTIgXTtcblx0XHR0aGlzLnkgPSBlWyAxMyBdO1xuXHRcdHRoaXMueiA9IGVbIDE0IF07XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0RnJvbU1hdHJpeFNjYWxlKCBtICkge1xuXG5cdFx0Y29uc3Qgc3ggPSB0aGlzLnNldEZyb21NYXRyaXhDb2x1bW4oIG0sIDAgKS5sZW5ndGgoKTtcblx0XHRjb25zdCBzeSA9IHRoaXMuc2V0RnJvbU1hdHJpeENvbHVtbiggbSwgMSApLmxlbmd0aCgpO1xuXHRcdGNvbnN0IHN6ID0gdGhpcy5zZXRGcm9tTWF0cml4Q29sdW1uKCBtLCAyICkubGVuZ3RoKCk7XG5cblx0XHR0aGlzLnggPSBzeDtcblx0XHR0aGlzLnkgPSBzeTtcblx0XHR0aGlzLnogPSBzejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRGcm9tTWF0cml4Q29sdW1uKCBtLCBpbmRleCApIHtcblxuXHRcdHJldHVybiB0aGlzLmZyb21BcnJheSggbS5lbGVtZW50cywgaW5kZXggKiA0ICk7XG5cblx0fVxuXG5cdHNldEZyb21NYXRyaXgzQ29sdW1uKCBtLCBpbmRleCApIHtcblxuXHRcdHJldHVybiB0aGlzLmZyb21BcnJheSggbS5lbGVtZW50cywgaW5kZXggKiAzICk7XG5cblx0fVxuXG5cdHNldEZyb21FdWxlciggZSApIHtcblxuXHRcdHRoaXMueCA9IGUuX3g7XG5cdFx0dGhpcy55ID0gZS5feTtcblx0XHR0aGlzLnogPSBlLl96O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21Db2xvciggYyApIHtcblxuXHRcdHRoaXMueCA9IGMucjtcblx0XHR0aGlzLnkgPSBjLmc7XG5cdFx0dGhpcy56ID0gYy5iO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGVxdWFscyggdiApIHtcblxuXHRcdHJldHVybiAoICggdi54ID09PSB0aGlzLnggKSAmJiAoIHYueSA9PT0gdGhpcy55ICkgJiYgKCB2LnogPT09IHRoaXMueiApICk7XG5cblx0fVxuXG5cdGZyb21BcnJheSggYXJyYXksIG9mZnNldCA9IDAgKSB7XG5cblx0XHR0aGlzLnggPSBhcnJheVsgb2Zmc2V0IF07XG5cdFx0dGhpcy55ID0gYXJyYXlbIG9mZnNldCArIDEgXTtcblx0XHR0aGlzLnogPSBhcnJheVsgb2Zmc2V0ICsgMiBdO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHRvQXJyYXkoIGFycmF5ID0gW10sIG9mZnNldCA9IDAgKSB7XG5cblx0XHRhcnJheVsgb2Zmc2V0IF0gPSB0aGlzLng7XG5cdFx0YXJyYXlbIG9mZnNldCArIDEgXSA9IHRoaXMueTtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMiBdID0gdGhpcy56O1xuXG5cdFx0cmV0dXJuIGFycmF5O1xuXG5cdH1cblxuXHRmcm9tQnVmZmVyQXR0cmlidXRlKCBhdHRyaWJ1dGUsIGluZGV4ICkge1xuXG5cdFx0dGhpcy54ID0gYXR0cmlidXRlLmdldFgoIGluZGV4ICk7XG5cdFx0dGhpcy55ID0gYXR0cmlidXRlLmdldFkoIGluZGV4ICk7XG5cdFx0dGhpcy56ID0gYXR0cmlidXRlLmdldFooIGluZGV4ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0cmFuZG9tKCkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5yYW5kb20oKTtcblx0XHR0aGlzLnkgPSBNYXRoLnJhbmRvbSgpO1xuXHRcdHRoaXMueiA9IE1hdGgucmFuZG9tKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0cmFuZG9tRGlyZWN0aW9uKCkge1xuXG5cdFx0Ly8gRGVyaXZlZCBmcm9tIGh0dHBzOi8vbWF0aHdvcmxkLndvbGZyYW0uY29tL1NwaGVyZVBvaW50UGlja2luZy5odG1sXG5cblx0XHRjb25zdCB1ID0gKCBNYXRoLnJhbmRvbSgpIC0gMC41ICkgKiAyO1xuXHRcdGNvbnN0IHQgPSBNYXRoLnJhbmRvbSgpICogTWF0aC5QSSAqIDI7XG5cdFx0Y29uc3QgZiA9IE1hdGguc3FydCggMSAtIHUgKiogMiApO1xuXG5cdFx0dGhpcy54ID0gZiAqIE1hdGguY29zKCB0ICk7XG5cdFx0dGhpcy55ID0gZiAqIE1hdGguc2luKCB0ICk7XG5cdFx0dGhpcy56ID0gdTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQqWyBTeW1ib2wuaXRlcmF0b3IgXSgpIHtcblxuXHRcdHlpZWxkIHRoaXMueDtcblx0XHR5aWVsZCB0aGlzLnk7XG5cdFx0eWllbGQgdGhpcy56O1xuXG5cdH1cblxufVxuXG5jb25zdCBfdmVjdG9yID0gLypAX19QVVJFX18qLyBuZXcgVmVjdG9yMygpO1xuY29uc3QgX3F1YXRlcm5pb24gPSAvKkBfX1BVUkVfXyovIG5ldyBRdWF0ZXJuaW9uKCk7XG5cbmV4cG9ydCB7IFZlY3RvcjMgfTtcbiIsImltcG9ydCAqIGFzIE1hdGhVdGlscyBmcm9tICcuL01hdGhVdGlscy5qcyc7XG5cbmNsYXNzIFZlY3RvcjIge1xuXG5cdGNvbnN0cnVjdG9yKCB4ID0gMCwgeSA9IDAgKSB7XG5cblx0XHRWZWN0b3IyLnByb3RvdHlwZS5pc1ZlY3RvcjIgPSB0cnVlO1xuXG5cdFx0dGhpcy54ID0geDtcblx0XHR0aGlzLnkgPSB5O1xuXG5cdH1cblxuXHRnZXQgd2lkdGgoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy54O1xuXG5cdH1cblxuXHRzZXQgd2lkdGgoIHZhbHVlICkge1xuXG5cdFx0dGhpcy54ID0gdmFsdWU7XG5cblx0fVxuXG5cdGdldCBoZWlnaHQoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy55O1xuXG5cdH1cblxuXHRzZXQgaGVpZ2h0KCB2YWx1ZSApIHtcblxuXHRcdHRoaXMueSA9IHZhbHVlO1xuXG5cdH1cblxuXHRzZXQoIHgsIHkgKSB7XG5cblx0XHR0aGlzLnggPSB4O1xuXHRcdHRoaXMueSA9IHk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0U2NhbGFyKCBzY2FsYXIgKSB7XG5cblx0XHR0aGlzLnggPSBzY2FsYXI7XG5cdFx0dGhpcy55ID0gc2NhbGFyO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldFgoIHggKSB7XG5cblx0XHR0aGlzLnggPSB4O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldFkoIHkgKSB7XG5cblx0XHR0aGlzLnkgPSB5O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldENvbXBvbmVudCggaW5kZXgsIHZhbHVlICkge1xuXG5cdFx0c3dpdGNoICggaW5kZXggKSB7XG5cblx0XHRcdGNhc2UgMDogdGhpcy54ID0gdmFsdWU7IGJyZWFrO1xuXHRcdFx0Y2FzZSAxOiB0aGlzLnkgPSB2YWx1ZTsgYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoICdpbmRleCBpcyBvdXQgb2YgcmFuZ2U6ICcgKyBpbmRleCApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGdldENvbXBvbmVudCggaW5kZXggKSB7XG5cblx0XHRzd2l0Y2ggKCBpbmRleCApIHtcblxuXHRcdFx0Y2FzZSAwOiByZXR1cm4gdGhpcy54O1xuXHRcdFx0Y2FzZSAxOiByZXR1cm4gdGhpcy55O1xuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCAnaW5kZXggaXMgb3V0IG9mIHJhbmdlOiAnICsgaW5kZXggKTtcblxuXHRcdH1cblxuXHR9XG5cblx0Y2xvbmUoKSB7XG5cblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoIHRoaXMueCwgdGhpcy55ICk7XG5cblx0fVxuXG5cdGNvcHkoIHYgKSB7XG5cblx0XHR0aGlzLnggPSB2Lng7XG5cdFx0dGhpcy55ID0gdi55O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGFkZCggdiApIHtcblxuXHRcdHRoaXMueCArPSB2Lng7XG5cdFx0dGhpcy55ICs9IHYueTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhZGRTY2FsYXIoIHMgKSB7XG5cblx0XHR0aGlzLnggKz0gcztcblx0XHR0aGlzLnkgKz0gcztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhZGRWZWN0b3JzKCBhLCBiICkge1xuXG5cdFx0dGhpcy54ID0gYS54ICsgYi54O1xuXHRcdHRoaXMueSA9IGEueSArIGIueTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhZGRTY2FsZWRWZWN0b3IoIHYsIHMgKSB7XG5cblx0XHR0aGlzLnggKz0gdi54ICogcztcblx0XHR0aGlzLnkgKz0gdi55ICogcztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzdWIoIHYgKSB7XG5cblx0XHR0aGlzLnggLT0gdi54O1xuXHRcdHRoaXMueSAtPSB2Lnk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c3ViU2NhbGFyKCBzICkge1xuXG5cdFx0dGhpcy54IC09IHM7XG5cdFx0dGhpcy55IC09IHM7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c3ViVmVjdG9ycyggYSwgYiApIHtcblxuXHRcdHRoaXMueCA9IGEueCAtIGIueDtcblx0XHR0aGlzLnkgPSBhLnkgLSBiLnk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bXVsdGlwbHkoIHYgKSB7XG5cblx0XHR0aGlzLnggKj0gdi54O1xuXHRcdHRoaXMueSAqPSB2Lnk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bXVsdGlwbHlTY2FsYXIoIHNjYWxhciApIHtcblxuXHRcdHRoaXMueCAqPSBzY2FsYXI7XG5cdFx0dGhpcy55ICo9IHNjYWxhcjtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRkaXZpZGUoIHYgKSB7XG5cblx0XHR0aGlzLnggLz0gdi54O1xuXHRcdHRoaXMueSAvPSB2Lnk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0ZGl2aWRlU2NhbGFyKCBzY2FsYXIgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhciggMSAvIHNjYWxhciApO1xuXG5cdH1cblxuXHRhcHBseU1hdHJpeDMoIG0gKSB7XG5cblx0XHRjb25zdCB4ID0gdGhpcy54LCB5ID0gdGhpcy55O1xuXHRcdGNvbnN0IGUgPSBtLmVsZW1lbnRzO1xuXG5cdFx0dGhpcy54ID0gZVsgMCBdICogeCArIGVbIDMgXSAqIHkgKyBlWyA2IF07XG5cdFx0dGhpcy55ID0gZVsgMSBdICogeCArIGVbIDQgXSAqIHkgKyBlWyA3IF07XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bWluKCB2ICkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5taW4oIHRoaXMueCwgdi54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5taW4oIHRoaXMueSwgdi55ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bWF4KCB2ICkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5tYXgoIHRoaXMueCwgdi54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5tYXgoIHRoaXMueSwgdi55ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y2xhbXAoIG1pbiwgbWF4ICkge1xuXG5cdFx0Ly8gYXNzdW1lcyBtaW4gPCBtYXgsIGNvbXBvbmVudHdpc2VcblxuXHRcdHRoaXMueCA9IE1hdGgubWF4KCBtaW4ueCwgTWF0aC5taW4oIG1heC54LCB0aGlzLnggKSApO1xuXHRcdHRoaXMueSA9IE1hdGgubWF4KCBtaW4ueSwgTWF0aC5taW4oIG1heC55LCB0aGlzLnkgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNsYW1wU2NhbGFyKCBtaW5WYWwsIG1heFZhbCApIHtcblxuXHRcdHRoaXMueCA9IE1hdGgubWF4KCBtaW5WYWwsIE1hdGgubWluKCBtYXhWYWwsIHRoaXMueCApICk7XG5cdFx0dGhpcy55ID0gTWF0aC5tYXgoIG1pblZhbCwgTWF0aC5taW4oIG1heFZhbCwgdGhpcy55ICkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjbGFtcExlbmd0aCggbWluLCBtYXggKSB7XG5cblx0XHRjb25zdCBsZW5ndGggPSB0aGlzLmxlbmd0aCgpO1xuXG5cdFx0cmV0dXJuIHRoaXMuZGl2aWRlU2NhbGFyKCBsZW5ndGggfHwgMSApLm11bHRpcGx5U2NhbGFyKCBNYXRoLm1heCggbWluLCBNYXRoLm1pbiggbWF4LCBsZW5ndGggKSApICk7XG5cblx0fVxuXG5cdGZsb29yKCkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5mbG9vciggdGhpcy54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5mbG9vciggdGhpcy55ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y2VpbCgpIHtcblxuXHRcdHRoaXMueCA9IE1hdGguY2VpbCggdGhpcy54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5jZWlsKCB0aGlzLnkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRyb3VuZCgpIHtcblxuXHRcdHRoaXMueCA9IE1hdGgucm91bmQoIHRoaXMueCApO1xuXHRcdHRoaXMueSA9IE1hdGgucm91bmQoIHRoaXMueSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHJvdW5kVG9aZXJvKCkge1xuXG5cdFx0dGhpcy54ID0gKCB0aGlzLnggPCAwICkgPyBNYXRoLmNlaWwoIHRoaXMueCApIDogTWF0aC5mbG9vciggdGhpcy54ICk7XG5cdFx0dGhpcy55ID0gKCB0aGlzLnkgPCAwICkgPyBNYXRoLmNlaWwoIHRoaXMueSApIDogTWF0aC5mbG9vciggdGhpcy55ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bmVnYXRlKCkge1xuXG5cdFx0dGhpcy54ID0gLSB0aGlzLng7XG5cdFx0dGhpcy55ID0gLSB0aGlzLnk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0ZG90KCB2ICkge1xuXG5cdFx0cmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueTtcblxuXHR9XG5cblx0Y3Jvc3MoIHYgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54O1xuXG5cdH1cblxuXHRsZW5ndGhTcSgpIHtcblxuXHRcdHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnk7XG5cblx0fVxuXG5cdGxlbmd0aCgpIHtcblxuXHRcdHJldHVybiBNYXRoLnNxcnQoIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSApO1xuXG5cdH1cblxuXHRtYW5oYXR0YW5MZW5ndGgoKSB7XG5cblx0XHRyZXR1cm4gTWF0aC5hYnMoIHRoaXMueCApICsgTWF0aC5hYnMoIHRoaXMueSApO1xuXG5cdH1cblxuXHRub3JtYWxpemUoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIoIHRoaXMubGVuZ3RoKCkgfHwgMSApO1xuXG5cdH1cblxuXHRhbmdsZSgpIHtcblxuXHRcdC8vIGNvbXB1dGVzIHRoZSBhbmdsZSBpbiByYWRpYW5zIHdpdGggcmVzcGVjdCB0byB0aGUgcG9zaXRpdmUgeC1heGlzXG5cblx0XHRjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIoIC0gdGhpcy55LCAtIHRoaXMueCApICsgTWF0aC5QSTtcblxuXHRcdHJldHVybiBhbmdsZTtcblxuXHR9XG5cblx0YW5nbGVUbyggdiApIHtcblxuXHRcdGNvbnN0IGRlbm9taW5hdG9yID0gTWF0aC5zcXJ0KCB0aGlzLmxlbmd0aFNxKCkgKiB2Lmxlbmd0aFNxKCkgKTtcblxuXHRcdGlmICggZGVub21pbmF0b3IgPT09IDAgKSByZXR1cm4gTWF0aC5QSSAvIDI7XG5cblx0XHRjb25zdCB0aGV0YSA9IHRoaXMuZG90KCB2ICkgLyBkZW5vbWluYXRvcjtcblxuXHRcdC8vIGNsYW1wLCB0byBoYW5kbGUgbnVtZXJpY2FsIHByb2JsZW1zXG5cblx0XHRyZXR1cm4gTWF0aC5hY29zKCBNYXRoVXRpbHMuY2xhbXAoIHRoZXRhLCAtIDEsIDEgKSApO1xuXG5cdH1cblxuXHRkaXN0YW5jZVRvKCB2ICkge1xuXG5cdFx0cmV0dXJuIE1hdGguc3FydCggdGhpcy5kaXN0YW5jZVRvU3F1YXJlZCggdiApICk7XG5cblx0fVxuXG5cdGRpc3RhbmNlVG9TcXVhcmVkKCB2ICkge1xuXG5cdFx0Y29uc3QgZHggPSB0aGlzLnggLSB2LngsIGR5ID0gdGhpcy55IC0gdi55O1xuXHRcdHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeTtcblxuXHR9XG5cblx0bWFuaGF0dGFuRGlzdGFuY2VUbyggdiApIHtcblxuXHRcdHJldHVybiBNYXRoLmFicyggdGhpcy54IC0gdi54ICkgKyBNYXRoLmFicyggdGhpcy55IC0gdi55ICk7XG5cblx0fVxuXG5cdHNldExlbmd0aCggbGVuZ3RoICkge1xuXG5cdFx0cmV0dXJuIHRoaXMubm9ybWFsaXplKCkubXVsdGlwbHlTY2FsYXIoIGxlbmd0aCApO1xuXG5cdH1cblxuXHRsZXJwKCB2LCBhbHBoYSApIHtcblxuXHRcdHRoaXMueCArPSAoIHYueCAtIHRoaXMueCApICogYWxwaGE7XG5cdFx0dGhpcy55ICs9ICggdi55IC0gdGhpcy55ICkgKiBhbHBoYTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRsZXJwVmVjdG9ycyggdjEsIHYyLCBhbHBoYSApIHtcblxuXHRcdHRoaXMueCA9IHYxLnggKyAoIHYyLnggLSB2MS54ICkgKiBhbHBoYTtcblx0XHR0aGlzLnkgPSB2MS55ICsgKCB2Mi55IC0gdjEueSApICogYWxwaGE7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0ZXF1YWxzKCB2ICkge1xuXG5cdFx0cmV0dXJuICggKCB2LnggPT09IHRoaXMueCApICYmICggdi55ID09PSB0aGlzLnkgKSApO1xuXG5cdH1cblxuXHRmcm9tQXJyYXkoIGFycmF5LCBvZmZzZXQgPSAwICkge1xuXG5cdFx0dGhpcy54ID0gYXJyYXlbIG9mZnNldCBdO1xuXHRcdHRoaXMueSA9IGFycmF5WyBvZmZzZXQgKyAxIF07XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0dG9BcnJheSggYXJyYXkgPSBbXSwgb2Zmc2V0ID0gMCApIHtcblxuXHRcdGFycmF5WyBvZmZzZXQgXSA9IHRoaXMueDtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMSBdID0gdGhpcy55O1xuXG5cdFx0cmV0dXJuIGFycmF5O1xuXG5cdH1cblxuXHRmcm9tQnVmZmVyQXR0cmlidXRlKCBhdHRyaWJ1dGUsIGluZGV4ICkge1xuXG5cdFx0dGhpcy54ID0gYXR0cmlidXRlLmdldFgoIGluZGV4ICk7XG5cdFx0dGhpcy55ID0gYXR0cmlidXRlLmdldFkoIGluZGV4ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0cm90YXRlQXJvdW5kKCBjZW50ZXIsIGFuZ2xlICkge1xuXG5cdFx0Y29uc3QgYyA9IE1hdGguY29zKCBhbmdsZSApLCBzID0gTWF0aC5zaW4oIGFuZ2xlICk7XG5cblx0XHRjb25zdCB4ID0gdGhpcy54IC0gY2VudGVyLng7XG5cdFx0Y29uc3QgeSA9IHRoaXMueSAtIGNlbnRlci55O1xuXG5cdFx0dGhpcy54ID0geCAqIGMgLSB5ICogcyArIGNlbnRlci54O1xuXHRcdHRoaXMueSA9IHggKiBzICsgeSAqIGMgKyBjZW50ZXIueTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRyYW5kb20oKSB7XG5cblx0XHR0aGlzLnggPSBNYXRoLnJhbmRvbSgpO1xuXHRcdHRoaXMueSA9IE1hdGgucmFuZG9tKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0KlsgU3ltYm9sLml0ZXJhdG9yIF0oKSB7XG5cblx0XHR5aWVsZCB0aGlzLng7XG5cdFx0eWllbGQgdGhpcy55O1xuXG5cdH1cblxufVxuXG5leHBvcnQgeyBWZWN0b3IyIH07XG4iLCJleHBvcnQgY29uc3QgUkVWSVNJT04gPSAnMTU0JztcblxuZXhwb3J0IGNvbnN0IE1PVVNFID0geyBMRUZUOiAwLCBNSURETEU6IDEsIFJJR0hUOiAyLCBST1RBVEU6IDAsIERPTExZOiAxLCBQQU46IDIgfTtcbmV4cG9ydCBjb25zdCBUT1VDSCA9IHsgUk9UQVRFOiAwLCBQQU46IDEsIERPTExZX1BBTjogMiwgRE9MTFlfUk9UQVRFOiAzIH07XG5leHBvcnQgY29uc3QgQ3VsbEZhY2VOb25lID0gMDtcbmV4cG9ydCBjb25zdCBDdWxsRmFjZUJhY2sgPSAxO1xuZXhwb3J0IGNvbnN0IEN1bGxGYWNlRnJvbnQgPSAyO1xuZXhwb3J0IGNvbnN0IEN1bGxGYWNlRnJvbnRCYWNrID0gMztcbmV4cG9ydCBjb25zdCBCYXNpY1NoYWRvd01hcCA9IDA7XG5leHBvcnQgY29uc3QgUENGU2hhZG93TWFwID0gMTtcbmV4cG9ydCBjb25zdCBQQ0ZTb2Z0U2hhZG93TWFwID0gMjtcbmV4cG9ydCBjb25zdCBWU01TaGFkb3dNYXAgPSAzO1xuZXhwb3J0IGNvbnN0IEZyb250U2lkZSA9IDA7XG5leHBvcnQgY29uc3QgQmFja1NpZGUgPSAxO1xuZXhwb3J0IGNvbnN0IERvdWJsZVNpZGUgPSAyO1xuZXhwb3J0IGNvbnN0IFR3b1Bhc3NEb3VibGVTaWRlID0gMjsgLy8gcjE0OVxuZXhwb3J0IGNvbnN0IE5vQmxlbmRpbmcgPSAwO1xuZXhwb3J0IGNvbnN0IE5vcm1hbEJsZW5kaW5nID0gMTtcbmV4cG9ydCBjb25zdCBBZGRpdGl2ZUJsZW5kaW5nID0gMjtcbmV4cG9ydCBjb25zdCBTdWJ0cmFjdGl2ZUJsZW5kaW5nID0gMztcbmV4cG9ydCBjb25zdCBNdWx0aXBseUJsZW5kaW5nID0gNDtcbmV4cG9ydCBjb25zdCBDdXN0b21CbGVuZGluZyA9IDU7XG5leHBvcnQgY29uc3QgQWRkRXF1YXRpb24gPSAxMDA7XG5leHBvcnQgY29uc3QgU3VidHJhY3RFcXVhdGlvbiA9IDEwMTtcbmV4cG9ydCBjb25zdCBSZXZlcnNlU3VidHJhY3RFcXVhdGlvbiA9IDEwMjtcbmV4cG9ydCBjb25zdCBNaW5FcXVhdGlvbiA9IDEwMztcbmV4cG9ydCBjb25zdCBNYXhFcXVhdGlvbiA9IDEwNDtcbmV4cG9ydCBjb25zdCBaZXJvRmFjdG9yID0gMjAwO1xuZXhwb3J0IGNvbnN0IE9uZUZhY3RvciA9IDIwMTtcbmV4cG9ydCBjb25zdCBTcmNDb2xvckZhY3RvciA9IDIwMjtcbmV4cG9ydCBjb25zdCBPbmVNaW51c1NyY0NvbG9yRmFjdG9yID0gMjAzO1xuZXhwb3J0IGNvbnN0IFNyY0FscGhhRmFjdG9yID0gMjA0O1xuZXhwb3J0IGNvbnN0IE9uZU1pbnVzU3JjQWxwaGFGYWN0b3IgPSAyMDU7XG5leHBvcnQgY29uc3QgRHN0QWxwaGFGYWN0b3IgPSAyMDY7XG5leHBvcnQgY29uc3QgT25lTWludXNEc3RBbHBoYUZhY3RvciA9IDIwNztcbmV4cG9ydCBjb25zdCBEc3RDb2xvckZhY3RvciA9IDIwODtcbmV4cG9ydCBjb25zdCBPbmVNaW51c0RzdENvbG9yRmFjdG9yID0gMjA5O1xuZXhwb3J0IGNvbnN0IFNyY0FscGhhU2F0dXJhdGVGYWN0b3IgPSAyMTA7XG5leHBvcnQgY29uc3QgTmV2ZXJEZXB0aCA9IDA7XG5leHBvcnQgY29uc3QgQWx3YXlzRGVwdGggPSAxO1xuZXhwb3J0IGNvbnN0IExlc3NEZXB0aCA9IDI7XG5leHBvcnQgY29uc3QgTGVzc0VxdWFsRGVwdGggPSAzO1xuZXhwb3J0IGNvbnN0IEVxdWFsRGVwdGggPSA0O1xuZXhwb3J0IGNvbnN0IEdyZWF0ZXJFcXVhbERlcHRoID0gNTtcbmV4cG9ydCBjb25zdCBHcmVhdGVyRGVwdGggPSA2O1xuZXhwb3J0IGNvbnN0IE5vdEVxdWFsRGVwdGggPSA3O1xuZXhwb3J0IGNvbnN0IE11bHRpcGx5T3BlcmF0aW9uID0gMDtcbmV4cG9ydCBjb25zdCBNaXhPcGVyYXRpb24gPSAxO1xuZXhwb3J0IGNvbnN0IEFkZE9wZXJhdGlvbiA9IDI7XG5leHBvcnQgY29uc3QgTm9Ub25lTWFwcGluZyA9IDA7XG5leHBvcnQgY29uc3QgTGluZWFyVG9uZU1hcHBpbmcgPSAxO1xuZXhwb3J0IGNvbnN0IFJlaW5oYXJkVG9uZU1hcHBpbmcgPSAyO1xuZXhwb3J0IGNvbnN0IENpbmVvblRvbmVNYXBwaW5nID0gMztcbmV4cG9ydCBjb25zdCBBQ0VTRmlsbWljVG9uZU1hcHBpbmcgPSA0O1xuZXhwb3J0IGNvbnN0IEN1c3RvbVRvbmVNYXBwaW5nID0gNTtcblxuZXhwb3J0IGNvbnN0IFVWTWFwcGluZyA9IDMwMDtcbmV4cG9ydCBjb25zdCBDdWJlUmVmbGVjdGlvbk1hcHBpbmcgPSAzMDE7XG5leHBvcnQgY29uc3QgQ3ViZVJlZnJhY3Rpb25NYXBwaW5nID0gMzAyO1xuZXhwb3J0IGNvbnN0IEVxdWlyZWN0YW5ndWxhclJlZmxlY3Rpb25NYXBwaW5nID0gMzAzO1xuZXhwb3J0IGNvbnN0IEVxdWlyZWN0YW5ndWxhclJlZnJhY3Rpb25NYXBwaW5nID0gMzA0O1xuZXhwb3J0IGNvbnN0IEN1YmVVVlJlZmxlY3Rpb25NYXBwaW5nID0gMzA2O1xuZXhwb3J0IGNvbnN0IFJlcGVhdFdyYXBwaW5nID0gMTAwMDtcbmV4cG9ydCBjb25zdCBDbGFtcFRvRWRnZVdyYXBwaW5nID0gMTAwMTtcbmV4cG9ydCBjb25zdCBNaXJyb3JlZFJlcGVhdFdyYXBwaW5nID0gMTAwMjtcbmV4cG9ydCBjb25zdCBOZWFyZXN0RmlsdGVyID0gMTAwMztcbmV4cG9ydCBjb25zdCBOZWFyZXN0TWlwbWFwTmVhcmVzdEZpbHRlciA9IDEwMDQ7XG5leHBvcnQgY29uc3QgTmVhcmVzdE1pcE1hcE5lYXJlc3RGaWx0ZXIgPSAxMDA0O1xuZXhwb3J0IGNvbnN0IE5lYXJlc3RNaXBtYXBMaW5lYXJGaWx0ZXIgPSAxMDA1O1xuZXhwb3J0IGNvbnN0IE5lYXJlc3RNaXBNYXBMaW5lYXJGaWx0ZXIgPSAxMDA1O1xuZXhwb3J0IGNvbnN0IExpbmVhckZpbHRlciA9IDEwMDY7XG5leHBvcnQgY29uc3QgTGluZWFyTWlwbWFwTmVhcmVzdEZpbHRlciA9IDEwMDc7XG5leHBvcnQgY29uc3QgTGluZWFyTWlwTWFwTmVhcmVzdEZpbHRlciA9IDEwMDc7XG5leHBvcnQgY29uc3QgTGluZWFyTWlwbWFwTGluZWFyRmlsdGVyID0gMTAwODtcbmV4cG9ydCBjb25zdCBMaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXIgPSAxMDA4O1xuZXhwb3J0IGNvbnN0IFVuc2lnbmVkQnl0ZVR5cGUgPSAxMDA5O1xuZXhwb3J0IGNvbnN0IEJ5dGVUeXBlID0gMTAxMDtcbmV4cG9ydCBjb25zdCBTaG9ydFR5cGUgPSAxMDExO1xuZXhwb3J0IGNvbnN0IFVuc2lnbmVkU2hvcnRUeXBlID0gMTAxMjtcbmV4cG9ydCBjb25zdCBJbnRUeXBlID0gMTAxMztcbmV4cG9ydCBjb25zdCBVbnNpZ25lZEludFR5cGUgPSAxMDE0O1xuZXhwb3J0IGNvbnN0IEZsb2F0VHlwZSA9IDEwMTU7XG5leHBvcnQgY29uc3QgSGFsZkZsb2F0VHlwZSA9IDEwMTY7XG5leHBvcnQgY29uc3QgVW5zaWduZWRTaG9ydDQ0NDRUeXBlID0gMTAxNztcbmV4cG9ydCBjb25zdCBVbnNpZ25lZFNob3J0NTU1MVR5cGUgPSAxMDE4O1xuZXhwb3J0IGNvbnN0IFVuc2lnbmVkSW50MjQ4VHlwZSA9IDEwMjA7XG5leHBvcnQgY29uc3QgQWxwaGFGb3JtYXQgPSAxMDIxO1xuZXhwb3J0IGNvbnN0IFJHQkFGb3JtYXQgPSAxMDIzO1xuZXhwb3J0IGNvbnN0IEx1bWluYW5jZUZvcm1hdCA9IDEwMjQ7XG5leHBvcnQgY29uc3QgTHVtaW5hbmNlQWxwaGFGb3JtYXQgPSAxMDI1O1xuZXhwb3J0IGNvbnN0IERlcHRoRm9ybWF0ID0gMTAyNjtcbmV4cG9ydCBjb25zdCBEZXB0aFN0ZW5jaWxGb3JtYXQgPSAxMDI3O1xuZXhwb3J0IGNvbnN0IFJlZEZvcm1hdCA9IDEwMjg7XG5leHBvcnQgY29uc3QgUmVkSW50ZWdlckZvcm1hdCA9IDEwMjk7XG5leHBvcnQgY29uc3QgUkdGb3JtYXQgPSAxMDMwO1xuZXhwb3J0IGNvbnN0IFJHSW50ZWdlckZvcm1hdCA9IDEwMzE7XG5leHBvcnQgY29uc3QgUkdCQUludGVnZXJGb3JtYXQgPSAxMDMzO1xuXG5leHBvcnQgY29uc3QgUkdCX1MzVENfRFhUMV9Gb3JtYXQgPSAzMzc3NjtcbmV4cG9ydCBjb25zdCBSR0JBX1MzVENfRFhUMV9Gb3JtYXQgPSAzMzc3NztcbmV4cG9ydCBjb25zdCBSR0JBX1MzVENfRFhUM19Gb3JtYXQgPSAzMzc3ODtcbmV4cG9ydCBjb25zdCBSR0JBX1MzVENfRFhUNV9Gb3JtYXQgPSAzMzc3OTtcbmV4cG9ydCBjb25zdCBSR0JfUFZSVENfNEJQUFYxX0Zvcm1hdCA9IDM1ODQwO1xuZXhwb3J0IGNvbnN0IFJHQl9QVlJUQ18yQlBQVjFfRm9ybWF0ID0gMzU4NDE7XG5leHBvcnQgY29uc3QgUkdCQV9QVlJUQ180QlBQVjFfRm9ybWF0ID0gMzU4NDI7XG5leHBvcnQgY29uc3QgUkdCQV9QVlJUQ18yQlBQVjFfRm9ybWF0ID0gMzU4NDM7XG5leHBvcnQgY29uc3QgUkdCX0VUQzFfRm9ybWF0ID0gMzYxOTY7XG5leHBvcnQgY29uc3QgUkdCX0VUQzJfRm9ybWF0ID0gMzc0OTI7XG5leHBvcnQgY29uc3QgUkdCQV9FVEMyX0VBQ19Gb3JtYXQgPSAzNzQ5NjtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfNHg0X0Zvcm1hdCA9IDM3ODA4O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ181eDRfRm9ybWF0ID0gMzc4MDk7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzV4NV9Gb3JtYXQgPSAzNzgxMDtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfNng1X0Zvcm1hdCA9IDM3ODExO1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ182eDZfRm9ybWF0ID0gMzc4MTI7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzh4NV9Gb3JtYXQgPSAzNzgxMztcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfOHg2X0Zvcm1hdCA9IDM3ODE0O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ184eDhfRm9ybWF0ID0gMzc4MTU7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEweDVfRm9ybWF0ID0gMzc4MTY7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEweDZfRm9ybWF0ID0gMzc4MTc7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEweDhfRm9ybWF0ID0gMzc4MTg7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEweDEwX0Zvcm1hdCA9IDM3ODE5O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ18xMngxMF9Gb3JtYXQgPSAzNzgyMDtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfMTJ4MTJfRm9ybWF0ID0gMzc4MjE7XG5leHBvcnQgY29uc3QgUkdCQV9CUFRDX0Zvcm1hdCA9IDM2NDkyO1xuZXhwb3J0IGNvbnN0IFJFRF9SR1RDMV9Gb3JtYXQgPSAzNjI4MztcbmV4cG9ydCBjb25zdCBTSUdORURfUkVEX1JHVEMxX0Zvcm1hdCA9IDM2Mjg0O1xuZXhwb3J0IGNvbnN0IFJFRF9HUkVFTl9SR1RDMl9Gb3JtYXQgPSAzNjI4NTtcbmV4cG9ydCBjb25zdCBTSUdORURfUkVEX0dSRUVOX1JHVEMyX0Zvcm1hdCA9IDM2Mjg2O1xuZXhwb3J0IGNvbnN0IExvb3BPbmNlID0gMjIwMDtcbmV4cG9ydCBjb25zdCBMb29wUmVwZWF0ID0gMjIwMTtcbmV4cG9ydCBjb25zdCBMb29wUGluZ1BvbmcgPSAyMjAyO1xuZXhwb3J0IGNvbnN0IEludGVycG9sYXRlRGlzY3JldGUgPSAyMzAwO1xuZXhwb3J0IGNvbnN0IEludGVycG9sYXRlTGluZWFyID0gMjMwMTtcbmV4cG9ydCBjb25zdCBJbnRlcnBvbGF0ZVNtb290aCA9IDIzMDI7XG5leHBvcnQgY29uc3QgWmVyb0N1cnZhdHVyZUVuZGluZyA9IDI0MDA7XG5leHBvcnQgY29uc3QgWmVyb1Nsb3BlRW5kaW5nID0gMjQwMTtcbmV4cG9ydCBjb25zdCBXcmFwQXJvdW5kRW5kaW5nID0gMjQwMjtcbmV4cG9ydCBjb25zdCBOb3JtYWxBbmltYXRpb25CbGVuZE1vZGUgPSAyNTAwO1xuZXhwb3J0IGNvbnN0IEFkZGl0aXZlQW5pbWF0aW9uQmxlbmRNb2RlID0gMjUwMTtcbmV4cG9ydCBjb25zdCBUcmlhbmdsZXNEcmF3TW9kZSA9IDA7XG5leHBvcnQgY29uc3QgVHJpYW5nbGVTdHJpcERyYXdNb2RlID0gMTtcbmV4cG9ydCBjb25zdCBUcmlhbmdsZUZhbkRyYXdNb2RlID0gMjtcbi8qKiBAZGVwcmVjYXRlZCBVc2UgTGluZWFyU1JHQkNvbG9yU3BhY2Ugb3IgTm9Db2xvclNwYWNlIGluIHRocmVlLmpzIHIxNTIrLiAqL1xuZXhwb3J0IGNvbnN0IExpbmVhckVuY29kaW5nID0gMzAwMDtcbi8qKiBAZGVwcmVjYXRlZCBVc2UgU1JHQkNvbG9yU3BhY2UgaW4gdGhyZWUuanMgcjE1MisuICovXG5leHBvcnQgY29uc3Qgc1JHQkVuY29kaW5nID0gMzAwMTtcbmV4cG9ydCBjb25zdCBCYXNpY0RlcHRoUGFja2luZyA9IDMyMDA7XG5leHBvcnQgY29uc3QgUkdCQURlcHRoUGFja2luZyA9IDMyMDE7XG5leHBvcnQgY29uc3QgVGFuZ2VudFNwYWNlTm9ybWFsTWFwID0gMDtcbmV4cG9ydCBjb25zdCBPYmplY3RTcGFjZU5vcm1hbE1hcCA9IDE7XG5cbi8vIENvbG9yIHNwYWNlIHN0cmluZyBpZGVudGlmaWVycywgbWF0Y2hpbmcgQ1NTIENvbG9yIE1vZHVsZSBMZXZlbCA0IGFuZCBXZWJHUFUgbmFtZXMgd2hlcmUgYXZhaWxhYmxlLlxuZXhwb3J0IGNvbnN0IE5vQ29sb3JTcGFjZSA9ICcnO1xuZXhwb3J0IGNvbnN0IFNSR0JDb2xvclNwYWNlID0gJ3NyZ2InO1xuZXhwb3J0IGNvbnN0IExpbmVhclNSR0JDb2xvclNwYWNlID0gJ3NyZ2ItbGluZWFyJztcbmV4cG9ydCBjb25zdCBEaXNwbGF5UDNDb2xvclNwYWNlID0gJ2Rpc3BsYXktcDMnO1xuXG5leHBvcnQgY29uc3QgWmVyb1N0ZW5jaWxPcCA9IDA7XG5leHBvcnQgY29uc3QgS2VlcFN0ZW5jaWxPcCA9IDc2ODA7XG5leHBvcnQgY29uc3QgUmVwbGFjZVN0ZW5jaWxPcCA9IDc2ODE7XG5leHBvcnQgY29uc3QgSW5jcmVtZW50U3RlbmNpbE9wID0gNzY4MjtcbmV4cG9ydCBjb25zdCBEZWNyZW1lbnRTdGVuY2lsT3AgPSA3NjgzO1xuZXhwb3J0IGNvbnN0IEluY3JlbWVudFdyYXBTdGVuY2lsT3AgPSAzNDA1NTtcbmV4cG9ydCBjb25zdCBEZWNyZW1lbnRXcmFwU3RlbmNpbE9wID0gMzQwNTY7XG5leHBvcnQgY29uc3QgSW52ZXJ0U3RlbmNpbE9wID0gNTM4NjtcblxuZXhwb3J0IGNvbnN0IE5ldmVyU3RlbmNpbEZ1bmMgPSA1MTI7XG5leHBvcnQgY29uc3QgTGVzc1N0ZW5jaWxGdW5jID0gNTEzO1xuZXhwb3J0IGNvbnN0IEVxdWFsU3RlbmNpbEZ1bmMgPSA1MTQ7XG5leHBvcnQgY29uc3QgTGVzc0VxdWFsU3RlbmNpbEZ1bmMgPSA1MTU7XG5leHBvcnQgY29uc3QgR3JlYXRlclN0ZW5jaWxGdW5jID0gNTE2O1xuZXhwb3J0IGNvbnN0IE5vdEVxdWFsU3RlbmNpbEZ1bmMgPSA1MTc7XG5leHBvcnQgY29uc3QgR3JlYXRlckVxdWFsU3RlbmNpbEZ1bmMgPSA1MTg7XG5leHBvcnQgY29uc3QgQWx3YXlzU3RlbmNpbEZ1bmMgPSA1MTk7XG5cbmV4cG9ydCBjb25zdCBOZXZlckNvbXBhcmUgPSA1MTI7XG5leHBvcnQgY29uc3QgTGVzc0NvbXBhcmUgPSA1MTM7XG5leHBvcnQgY29uc3QgRXF1YWxDb21wYXJlID0gNTE0O1xuZXhwb3J0IGNvbnN0IExlc3NFcXVhbENvbXBhcmUgPSA1MTU7XG5leHBvcnQgY29uc3QgR3JlYXRlckNvbXBhcmUgPSA1MTY7XG5leHBvcnQgY29uc3QgTm90RXF1YWxDb21wYXJlID0gNTE3O1xuZXhwb3J0IGNvbnN0IEdyZWF0ZXJFcXVhbENvbXBhcmUgPSA1MTg7XG5leHBvcnQgY29uc3QgQWx3YXlzQ29tcGFyZSA9IDUxOTtcblxuZXhwb3J0IGNvbnN0IFN0YXRpY0RyYXdVc2FnZSA9IDM1MDQ0O1xuZXhwb3J0IGNvbnN0IER5bmFtaWNEcmF3VXNhZ2UgPSAzNTA0ODtcbmV4cG9ydCBjb25zdCBTdHJlYW1EcmF3VXNhZ2UgPSAzNTA0MDtcbmV4cG9ydCBjb25zdCBTdGF0aWNSZWFkVXNhZ2UgPSAzNTA0NTtcbmV4cG9ydCBjb25zdCBEeW5hbWljUmVhZFVzYWdlID0gMzUwNDk7XG5leHBvcnQgY29uc3QgU3RyZWFtUmVhZFVzYWdlID0gMzUwNDE7XG5leHBvcnQgY29uc3QgU3RhdGljQ29weVVzYWdlID0gMzUwNDY7XG5leHBvcnQgY29uc3QgRHluYW1pY0NvcHlVc2FnZSA9IDM1MDUwO1xuZXhwb3J0IGNvbnN0IFN0cmVhbUNvcHlVc2FnZSA9IDM1MDQyO1xuXG5leHBvcnQgY29uc3QgR0xTTDEgPSAnMTAwJztcbmV4cG9ydCBjb25zdCBHTFNMMyA9ICczMDAgZXMnO1xuXG5leHBvcnQgY29uc3QgX1NSR0JBRm9ybWF0ID0gMTAzNTsgLy8gZmFsbGJhY2sgZm9yIFdlYkdMIDFcblxuZXhwb3J0IGNvbnN0IFdlYkdMQ29vcmRpbmF0ZVN5c3RlbSA9IDIwMDA7XG5leHBvcnQgY29uc3QgV2ViR1BVQ29vcmRpbmF0ZVN5c3RlbSA9IDIwMDE7XG4iLCJpbXBvcnQgeyBWZWN0b3IzIH0gZnJvbSAnLi4vbWF0aC9WZWN0b3IzLmpzJztcbmltcG9ydCB7IFZlY3RvcjIgfSBmcm9tICcuLi9tYXRoL1ZlY3RvcjIuanMnO1xuaW1wb3J0IHsgZGVub3JtYWxpemUsIG5vcm1hbGl6ZSB9IGZyb20gJy4uL21hdGgvTWF0aFV0aWxzLmpzJztcbmltcG9ydCB7IFN0YXRpY0RyYXdVc2FnZSwgRmxvYXRUeXBlIH0gZnJvbSAnLi4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IGZyb21IYWxmRmxvYXQsIHRvSGFsZkZsb2F0IH0gZnJvbSAnLi4vZXh0cmFzL0RhdGFVdGlscy5qcyc7XG5cbmNvbnN0IF92ZWN0b3IgPSAvKkBfX1BVUkVfXyovIG5ldyBWZWN0b3IzKCk7XG5jb25zdCBfdmVjdG9yMiA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjIoKTtcblxuY2xhc3MgQnVmZmVyQXR0cmlidXRlIHtcblxuXHRjb25zdHJ1Y3RvciggYXJyYXksIGl0ZW1TaXplLCBub3JtYWxpemVkID0gZmFsc2UgKSB7XG5cblx0XHRpZiAoIEFycmF5LmlzQXJyYXkoIGFycmF5ICkgKSB7XG5cblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoICdUSFJFRS5CdWZmZXJBdHRyaWJ1dGU6IGFycmF5IHNob3VsZCBiZSBhIFR5cGVkIEFycmF5LicgKTtcblxuXHRcdH1cblxuXHRcdHRoaXMuaXNCdWZmZXJBdHRyaWJ1dGUgPSB0cnVlO1xuXG5cdFx0dGhpcy5uYW1lID0gJyc7XG5cblx0XHR0aGlzLmFycmF5ID0gYXJyYXk7XG5cdFx0dGhpcy5pdGVtU2l6ZSA9IGl0ZW1TaXplO1xuXHRcdHRoaXMuY291bnQgPSBhcnJheSAhPT0gdW5kZWZpbmVkID8gYXJyYXkubGVuZ3RoIC8gaXRlbVNpemUgOiAwO1xuXHRcdHRoaXMubm9ybWFsaXplZCA9IG5vcm1hbGl6ZWQ7XG5cblx0XHR0aGlzLnVzYWdlID0gU3RhdGljRHJhd1VzYWdlO1xuXHRcdHRoaXMudXBkYXRlUmFuZ2UgPSB7IG9mZnNldDogMCwgY291bnQ6IC0gMSB9O1xuXHRcdHRoaXMuZ3B1VHlwZSA9IEZsb2F0VHlwZTtcblxuXHRcdHRoaXMudmVyc2lvbiA9IDA7XG5cblx0fVxuXG5cdG9uVXBsb2FkQ2FsbGJhY2soKSB7fVxuXG5cdHNldCBuZWVkc1VwZGF0ZSggdmFsdWUgKSB7XG5cblx0XHRpZiAoIHZhbHVlID09PSB0cnVlICkgdGhpcy52ZXJzaW9uICsrO1xuXG5cdH1cblxuXHRzZXRVc2FnZSggdmFsdWUgKSB7XG5cblx0XHR0aGlzLnVzYWdlID0gdmFsdWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y29weSggc291cmNlICkge1xuXG5cdFx0dGhpcy5uYW1lID0gc291cmNlLm5hbWU7XG5cdFx0dGhpcy5hcnJheSA9IG5ldyBzb3VyY2UuYXJyYXkuY29uc3RydWN0b3IoIHNvdXJjZS5hcnJheSApO1xuXHRcdHRoaXMuaXRlbVNpemUgPSBzb3VyY2UuaXRlbVNpemU7XG5cdFx0dGhpcy5jb3VudCA9IHNvdXJjZS5jb3VudDtcblx0XHR0aGlzLm5vcm1hbGl6ZWQgPSBzb3VyY2Uubm9ybWFsaXplZDtcblxuXHRcdHRoaXMudXNhZ2UgPSBzb3VyY2UudXNhZ2U7XG5cdFx0dGhpcy5ncHVUeXBlID0gc291cmNlLmdwdVR5cGU7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y29weUF0KCBpbmRleDEsIGF0dHJpYnV0ZSwgaW5kZXgyICkge1xuXG5cdFx0aW5kZXgxICo9IHRoaXMuaXRlbVNpemU7XG5cdFx0aW5kZXgyICo9IGF0dHJpYnV0ZS5pdGVtU2l6ZTtcblxuXHRcdGZvciAoIGxldCBpID0gMCwgbCA9IHRoaXMuaXRlbVNpemU7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHR0aGlzLmFycmF5WyBpbmRleDEgKyBpIF0gPSBhdHRyaWJ1dGUuYXJyYXlbIGluZGV4MiArIGkgXTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjb3B5QXJyYXkoIGFycmF5ICkge1xuXG5cdFx0dGhpcy5hcnJheS5zZXQoIGFycmF5ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0YXBwbHlNYXRyaXgzKCBtICkge1xuXG5cdFx0aWYgKCB0aGlzLml0ZW1TaXplID09PSAyICkge1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGwgPSB0aGlzLmNvdW50OyBpIDwgbDsgaSArKyApIHtcblxuXHRcdFx0XHRfdmVjdG9yMi5mcm9tQnVmZmVyQXR0cmlidXRlKCB0aGlzLCBpICk7XG5cdFx0XHRcdF92ZWN0b3IyLmFwcGx5TWF0cml4MyggbSApO1xuXG5cdFx0XHRcdHRoaXMuc2V0WFkoIGksIF92ZWN0b3IyLngsIF92ZWN0b3IyLnkgKTtcblxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIGlmICggdGhpcy5pdGVtU2l6ZSA9PT0gMyApIHtcblxuXHRcdFx0Zm9yICggbGV0IGkgPSAwLCBsID0gdGhpcy5jb3VudDsgaSA8IGw7IGkgKysgKSB7XG5cblx0XHRcdFx0X3ZlY3Rvci5mcm9tQnVmZmVyQXR0cmlidXRlKCB0aGlzLCBpICk7XG5cdFx0XHRcdF92ZWN0b3IuYXBwbHlNYXRyaXgzKCBtICk7XG5cblx0XHRcdFx0dGhpcy5zZXRYWVooIGksIF92ZWN0b3IueCwgX3ZlY3Rvci55LCBfdmVjdG9yLnogKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGFwcGx5TWF0cml4NCggbSApIHtcblxuXHRcdGZvciAoIGxldCBpID0gMCwgbCA9IHRoaXMuY291bnQ7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRfdmVjdG9yLmZyb21CdWZmZXJBdHRyaWJ1dGUoIHRoaXMsIGkgKTtcblxuXHRcdFx0X3ZlY3Rvci5hcHBseU1hdHJpeDQoIG0gKTtcblxuXHRcdFx0dGhpcy5zZXRYWVooIGksIF92ZWN0b3IueCwgX3ZlY3Rvci55LCBfdmVjdG9yLnogKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhcHBseU5vcm1hbE1hdHJpeCggbSApIHtcblxuXHRcdGZvciAoIGxldCBpID0gMCwgbCA9IHRoaXMuY291bnQ7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRfdmVjdG9yLmZyb21CdWZmZXJBdHRyaWJ1dGUoIHRoaXMsIGkgKTtcblxuXHRcdFx0X3ZlY3Rvci5hcHBseU5vcm1hbE1hdHJpeCggbSApO1xuXG5cdFx0XHR0aGlzLnNldFhZWiggaSwgX3ZlY3Rvci54LCBfdmVjdG9yLnksIF92ZWN0b3IueiApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHRyYW5zZm9ybURpcmVjdGlvbiggbSApIHtcblxuXHRcdGZvciAoIGxldCBpID0gMCwgbCA9IHRoaXMuY291bnQ7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRfdmVjdG9yLmZyb21CdWZmZXJBdHRyaWJ1dGUoIHRoaXMsIGkgKTtcblxuXHRcdFx0X3ZlY3Rvci50cmFuc2Zvcm1EaXJlY3Rpb24oIG0gKTtcblxuXHRcdFx0dGhpcy5zZXRYWVooIGksIF92ZWN0b3IueCwgX3ZlY3Rvci55LCBfdmVjdG9yLnogKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXQoIHZhbHVlLCBvZmZzZXQgPSAwICkge1xuXG5cdFx0Ly8gTWF0Y2hpbmcgQnVmZmVyQXR0cmlidXRlIGNvbnN0cnVjdG9yLCBkbyBub3Qgbm9ybWFsaXplIHRoZSBhcnJheS5cblx0XHR0aGlzLmFycmF5LnNldCggdmFsdWUsIG9mZnNldCApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGdldFgoIGluZGV4ICkge1xuXG5cdFx0bGV0IHggPSB0aGlzLmFycmF5WyBpbmRleCAqIHRoaXMuaXRlbVNpemUgXTtcblxuXHRcdGlmICggdGhpcy5ub3JtYWxpemVkICkgeCA9IGRlbm9ybWFsaXplKCB4LCB0aGlzLmFycmF5ICk7XG5cblx0XHRyZXR1cm4geDtcblxuXHR9XG5cblx0c2V0WCggaW5kZXgsIHggKSB7XG5cblx0XHRpZiAoIHRoaXMubm9ybWFsaXplZCApIHggPSBub3JtYWxpemUoIHgsIHRoaXMuYXJyYXkgKTtcblxuXHRcdHRoaXMuYXJyYXlbIGluZGV4ICogdGhpcy5pdGVtU2l6ZSBdID0geDtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRnZXRZKCBpbmRleCApIHtcblxuXHRcdGxldCB5ID0gdGhpcy5hcnJheVsgaW5kZXggKiB0aGlzLml0ZW1TaXplICsgMSBdO1xuXG5cdFx0aWYgKCB0aGlzLm5vcm1hbGl6ZWQgKSB5ID0gZGVub3JtYWxpemUoIHksIHRoaXMuYXJyYXkgKTtcblxuXHRcdHJldHVybiB5O1xuXG5cdH1cblxuXHRzZXRZKCBpbmRleCwgeSApIHtcblxuXHRcdGlmICggdGhpcy5ub3JtYWxpemVkICkgeSA9IG5vcm1hbGl6ZSggeSwgdGhpcy5hcnJheSApO1xuXG5cdFx0dGhpcy5hcnJheVsgaW5kZXggKiB0aGlzLml0ZW1TaXplICsgMSBdID0geTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRnZXRaKCBpbmRleCApIHtcblxuXHRcdGxldCB6ID0gdGhpcy5hcnJheVsgaW5kZXggKiB0aGlzLml0ZW1TaXplICsgMiBdO1xuXG5cdFx0aWYgKCB0aGlzLm5vcm1hbGl6ZWQgKSB6ID0gZGVub3JtYWxpemUoIHosIHRoaXMuYXJyYXkgKTtcblxuXHRcdHJldHVybiB6O1xuXG5cdH1cblxuXHRzZXRaKCBpbmRleCwgeiApIHtcblxuXHRcdGlmICggdGhpcy5ub3JtYWxpemVkICkgeiA9IG5vcm1hbGl6ZSggeiwgdGhpcy5hcnJheSApO1xuXG5cdFx0dGhpcy5hcnJheVsgaW5kZXggKiB0aGlzLml0ZW1TaXplICsgMiBdID0gejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRnZXRXKCBpbmRleCApIHtcblxuXHRcdGxldCB3ID0gdGhpcy5hcnJheVsgaW5kZXggKiB0aGlzLml0ZW1TaXplICsgMyBdO1xuXG5cdFx0aWYgKCB0aGlzLm5vcm1hbGl6ZWQgKSB3ID0gZGVub3JtYWxpemUoIHcsIHRoaXMuYXJyYXkgKTtcblxuXHRcdHJldHVybiB3O1xuXG5cdH1cblxuXHRzZXRXKCBpbmRleCwgdyApIHtcblxuXHRcdGlmICggdGhpcy5ub3JtYWxpemVkICkgdyA9IG5vcm1hbGl6ZSggdywgdGhpcy5hcnJheSApO1xuXG5cdFx0dGhpcy5hcnJheVsgaW5kZXggKiB0aGlzLml0ZW1TaXplICsgMyBdID0gdztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRYWSggaW5kZXgsIHgsIHkgKSB7XG5cblx0XHRpbmRleCAqPSB0aGlzLml0ZW1TaXplO1xuXG5cdFx0aWYgKCB0aGlzLm5vcm1hbGl6ZWQgKSB7XG5cblx0XHRcdHggPSBub3JtYWxpemUoIHgsIHRoaXMuYXJyYXkgKTtcblx0XHRcdHkgPSBub3JtYWxpemUoIHksIHRoaXMuYXJyYXkgKTtcblxuXHRcdH1cblxuXHRcdHRoaXMuYXJyYXlbIGluZGV4ICsgMCBdID0geDtcblx0XHR0aGlzLmFycmF5WyBpbmRleCArIDEgXSA9IHk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0WFlaKCBpbmRleCwgeCwgeSwgeiApIHtcblxuXHRcdGluZGV4ICo9IHRoaXMuaXRlbVNpemU7XG5cblx0XHRpZiAoIHRoaXMubm9ybWFsaXplZCApIHtcblxuXHRcdFx0eCA9IG5vcm1hbGl6ZSggeCwgdGhpcy5hcnJheSApO1xuXHRcdFx0eSA9IG5vcm1hbGl6ZSggeSwgdGhpcy5hcnJheSApO1xuXHRcdFx0eiA9IG5vcm1hbGl6ZSggeiwgdGhpcy5hcnJheSApO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5hcnJheVsgaW5kZXggKyAwIF0gPSB4O1xuXHRcdHRoaXMuYXJyYXlbIGluZGV4ICsgMSBdID0geTtcblx0XHR0aGlzLmFycmF5WyBpbmRleCArIDIgXSA9IHo7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0WFlaVyggaW5kZXgsIHgsIHksIHosIHcgKSB7XG5cblx0XHRpbmRleCAqPSB0aGlzLml0ZW1TaXplO1xuXG5cdFx0aWYgKCB0aGlzLm5vcm1hbGl6ZWQgKSB7XG5cblx0XHRcdHggPSBub3JtYWxpemUoIHgsIHRoaXMuYXJyYXkgKTtcblx0XHRcdHkgPSBub3JtYWxpemUoIHksIHRoaXMuYXJyYXkgKTtcblx0XHRcdHogPSBub3JtYWxpemUoIHosIHRoaXMuYXJyYXkgKTtcblx0XHRcdHcgPSBub3JtYWxpemUoIHcsIHRoaXMuYXJyYXkgKTtcblxuXHRcdH1cblxuXHRcdHRoaXMuYXJyYXlbIGluZGV4ICsgMCBdID0geDtcblx0XHR0aGlzLmFycmF5WyBpbmRleCArIDEgXSA9IHk7XG5cdFx0dGhpcy5hcnJheVsgaW5kZXggKyAyIF0gPSB6O1xuXHRcdHRoaXMuYXJyYXlbIGluZGV4ICsgMyBdID0gdztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRvblVwbG9hZCggY2FsbGJhY2sgKSB7XG5cblx0XHR0aGlzLm9uVXBsb2FkQ2FsbGJhY2sgPSBjYWxsYmFjaztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjbG9uZSgpIHtcblxuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvciggdGhpcy5hcnJheSwgdGhpcy5pdGVtU2l6ZSApLmNvcHkoIHRoaXMgKTtcblxuXHR9XG5cblx0dG9KU09OKCkge1xuXG5cdFx0Y29uc3QgZGF0YSA9IHtcblx0XHRcdGl0ZW1TaXplOiB0aGlzLml0ZW1TaXplLFxuXHRcdFx0dHlwZTogdGhpcy5hcnJheS5jb25zdHJ1Y3Rvci5uYW1lLFxuXHRcdFx0YXJyYXk6IEFycmF5LmZyb20oIHRoaXMuYXJyYXkgKSxcblx0XHRcdG5vcm1hbGl6ZWQ6IHRoaXMubm9ybWFsaXplZFxuXHRcdH07XG5cblx0XHRpZiAoIHRoaXMubmFtZSAhPT0gJycgKSBkYXRhLm5hbWUgPSB0aGlzLm5hbWU7XG5cdFx0aWYgKCB0aGlzLnVzYWdlICE9PSBTdGF0aWNEcmF3VXNhZ2UgKSBkYXRhLnVzYWdlID0gdGhpcy51c2FnZTtcblx0XHRpZiAoIHRoaXMudXBkYXRlUmFuZ2Uub2Zmc2V0ICE9PSAwIHx8IHRoaXMudXBkYXRlUmFuZ2UuY291bnQgIT09IC0gMSApIGRhdGEudXBkYXRlUmFuZ2UgPSB0aGlzLnVwZGF0ZVJhbmdlO1xuXG5cdFx0cmV0dXJuIGRhdGE7XG5cblx0fVxuXG59XG5cbi8vXG5cbmNsYXNzIEludDhCdWZmZXJBdHRyaWJ1dGUgZXh0ZW5kcyBCdWZmZXJBdHRyaWJ1dGUge1xuXG5cdGNvbnN0cnVjdG9yKCBhcnJheSwgaXRlbVNpemUsIG5vcm1hbGl6ZWQgKSB7XG5cblx0XHRzdXBlciggbmV3IEludDhBcnJheSggYXJyYXkgKSwgaXRlbVNpemUsIG5vcm1hbGl6ZWQgKTtcblxuXHR9XG5cbn1cblxuY2xhc3MgVWludDhCdWZmZXJBdHRyaWJ1dGUgZXh0ZW5kcyBCdWZmZXJBdHRyaWJ1dGUge1xuXG5cdGNvbnN0cnVjdG9yKCBhcnJheSwgaXRlbVNpemUsIG5vcm1hbGl6ZWQgKSB7XG5cblx0XHRzdXBlciggbmV3IFVpbnQ4QXJyYXkoIGFycmF5ICksIGl0ZW1TaXplLCBub3JtYWxpemVkICk7XG5cblx0fVxuXG59XG5cbmNsYXNzIFVpbnQ4Q2xhbXBlZEJ1ZmZlckF0dHJpYnV0ZSBleHRlbmRzIEJ1ZmZlckF0dHJpYnV0ZSB7XG5cblx0Y29uc3RydWN0b3IoIGFycmF5LCBpdGVtU2l6ZSwgbm9ybWFsaXplZCApIHtcblxuXHRcdHN1cGVyKCBuZXcgVWludDhDbGFtcGVkQXJyYXkoIGFycmF5ICksIGl0ZW1TaXplLCBub3JtYWxpemVkICk7XG5cblx0fVxuXG59XG5cbmNsYXNzIEludDE2QnVmZmVyQXR0cmlidXRlIGV4dGVuZHMgQnVmZmVyQXR0cmlidXRlIHtcblxuXHRjb25zdHJ1Y3RvciggYXJyYXksIGl0ZW1TaXplLCBub3JtYWxpemVkICkge1xuXG5cdFx0c3VwZXIoIG5ldyBJbnQxNkFycmF5KCBhcnJheSApLCBpdGVtU2l6ZSwgbm9ybWFsaXplZCApO1xuXG5cdH1cblxufVxuXG5jbGFzcyBVaW50MTZCdWZmZXJBdHRyaWJ1dGUgZXh0ZW5kcyBCdWZmZXJBdHRyaWJ1dGUge1xuXG5cdGNvbnN0cnVjdG9yKCBhcnJheSwgaXRlbVNpemUsIG5vcm1hbGl6ZWQgKSB7XG5cblx0XHRzdXBlciggbmV3IFVpbnQxNkFycmF5KCBhcnJheSApLCBpdGVtU2l6ZSwgbm9ybWFsaXplZCApO1xuXG5cdH1cblxufVxuXG5jbGFzcyBJbnQzMkJ1ZmZlckF0dHJpYnV0ZSBleHRlbmRzIEJ1ZmZlckF0dHJpYnV0ZSB7XG5cblx0Y29uc3RydWN0b3IoIGFycmF5LCBpdGVtU2l6ZSwgbm9ybWFsaXplZCApIHtcblxuXHRcdHN1cGVyKCBuZXcgSW50MzJBcnJheSggYXJyYXkgKSwgaXRlbVNpemUsIG5vcm1hbGl6ZWQgKTtcblxuXHR9XG5cbn1cblxuY2xhc3MgVWludDMyQnVmZmVyQXR0cmlidXRlIGV4dGVuZHMgQnVmZmVyQXR0cmlidXRlIHtcblxuXHRjb25zdHJ1Y3RvciggYXJyYXksIGl0ZW1TaXplLCBub3JtYWxpemVkICkge1xuXG5cdFx0c3VwZXIoIG5ldyBVaW50MzJBcnJheSggYXJyYXkgKSwgaXRlbVNpemUsIG5vcm1hbGl6ZWQgKTtcblxuXHR9XG5cbn1cblxuY2xhc3MgRmxvYXQxNkJ1ZmZlckF0dHJpYnV0ZSBleHRlbmRzIEJ1ZmZlckF0dHJpYnV0ZSB7XG5cblx0Y29uc3RydWN0b3IoIGFycmF5LCBpdGVtU2l6ZSwgbm9ybWFsaXplZCApIHtcblxuXHRcdHN1cGVyKCBuZXcgVWludDE2QXJyYXkoIGFycmF5ICksIGl0ZW1TaXplLCBub3JtYWxpemVkICk7XG5cblx0XHR0aGlzLmlzRmxvYXQxNkJ1ZmZlckF0dHJpYnV0ZSA9IHRydWU7XG5cblx0fVxuXG5cdGdldFgoIGluZGV4ICkge1xuXG5cdFx0bGV0IHggPSBmcm9tSGFsZkZsb2F0KCB0aGlzLmFycmF5WyBpbmRleCAqIHRoaXMuaXRlbVNpemUgXSApO1xuXG5cdFx0aWYgKCB0aGlzLm5vcm1hbGl6ZWQgKSB4ID0gZGVub3JtYWxpemUoIHgsIHRoaXMuYXJyYXkgKTtcblxuXHRcdHJldHVybiB4O1xuXG5cdH1cblxuXHRzZXRYKCBpbmRleCwgeCApIHtcblxuXHRcdGlmICggdGhpcy5ub3JtYWxpemVkICkgeCA9IG5vcm1hbGl6ZSggeCwgdGhpcy5hcnJheSApO1xuXG5cdFx0dGhpcy5hcnJheVsgaW5kZXggKiB0aGlzLml0ZW1TaXplIF0gPSB0b0hhbGZGbG9hdCggeCApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGdldFkoIGluZGV4ICkge1xuXG5cdFx0bGV0IHkgPSBmcm9tSGFsZkZsb2F0KCB0aGlzLmFycmF5WyBpbmRleCAqIHRoaXMuaXRlbVNpemUgKyAxIF0gKTtcblxuXHRcdGlmICggdGhpcy5ub3JtYWxpemVkICkgeSA9IGRlbm9ybWFsaXplKCB5LCB0aGlzLmFycmF5ICk7XG5cblx0XHRyZXR1cm4geTtcblxuXHR9XG5cblx0c2V0WSggaW5kZXgsIHkgKSB7XG5cblx0XHRpZiAoIHRoaXMubm9ybWFsaXplZCApIHkgPSBub3JtYWxpemUoIHksIHRoaXMuYXJyYXkgKTtcblxuXHRcdHRoaXMuYXJyYXlbIGluZGV4ICogdGhpcy5pdGVtU2l6ZSArIDEgXSA9IHRvSGFsZkZsb2F0KCB5ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Z2V0WiggaW5kZXggKSB7XG5cblx0XHRsZXQgeiA9IGZyb21IYWxmRmxvYXQoIHRoaXMuYXJyYXlbIGluZGV4ICogdGhpcy5pdGVtU2l6ZSArIDIgXSApO1xuXG5cdFx0aWYgKCB0aGlzLm5vcm1hbGl6ZWQgKSB6ID0gZGVub3JtYWxpemUoIHosIHRoaXMuYXJyYXkgKTtcblxuXHRcdHJldHVybiB6O1xuXG5cdH1cblxuXHRzZXRaKCBpbmRleCwgeiApIHtcblxuXHRcdGlmICggdGhpcy5ub3JtYWxpemVkICkgeiA9IG5vcm1hbGl6ZSggeiwgdGhpcy5hcnJheSApO1xuXG5cdFx0dGhpcy5hcnJheVsgaW5kZXggKiB0aGlzLml0ZW1TaXplICsgMiBdID0gdG9IYWxmRmxvYXQoIHogKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRnZXRXKCBpbmRleCApIHtcblxuXHRcdGxldCB3ID0gZnJvbUhhbGZGbG9hdCggdGhpcy5hcnJheVsgaW5kZXggKiB0aGlzLml0ZW1TaXplICsgMyBdICk7XG5cblx0XHRpZiAoIHRoaXMubm9ybWFsaXplZCApIHcgPSBkZW5vcm1hbGl6ZSggdywgdGhpcy5hcnJheSApO1xuXG5cdFx0cmV0dXJuIHc7XG5cblx0fVxuXG5cdHNldFcoIGluZGV4LCB3ICkge1xuXG5cdFx0aWYgKCB0aGlzLm5vcm1hbGl6ZWQgKSB3ID0gbm9ybWFsaXplKCB3LCB0aGlzLmFycmF5ICk7XG5cblx0XHR0aGlzLmFycmF5WyBpbmRleCAqIHRoaXMuaXRlbVNpemUgKyAzIF0gPSB0b0hhbGZGbG9hdCggdyApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldFhZKCBpbmRleCwgeCwgeSApIHtcblxuXHRcdGluZGV4ICo9IHRoaXMuaXRlbVNpemU7XG5cblx0XHRpZiAoIHRoaXMubm9ybWFsaXplZCApIHtcblxuXHRcdFx0eCA9IG5vcm1hbGl6ZSggeCwgdGhpcy5hcnJheSApO1xuXHRcdFx0eSA9IG5vcm1hbGl6ZSggeSwgdGhpcy5hcnJheSApO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5hcnJheVsgaW5kZXggKyAwIF0gPSB0b0hhbGZGbG9hdCggeCApO1xuXHRcdHRoaXMuYXJyYXlbIGluZGV4ICsgMSBdID0gdG9IYWxmRmxvYXQoIHkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRYWVooIGluZGV4LCB4LCB5LCB6ICkge1xuXG5cdFx0aW5kZXggKj0gdGhpcy5pdGVtU2l6ZTtcblxuXHRcdGlmICggdGhpcy5ub3JtYWxpemVkICkge1xuXG5cdFx0XHR4ID0gbm9ybWFsaXplKCB4LCB0aGlzLmFycmF5ICk7XG5cdFx0XHR5ID0gbm9ybWFsaXplKCB5LCB0aGlzLmFycmF5ICk7XG5cdFx0XHR6ID0gbm9ybWFsaXplKCB6LCB0aGlzLmFycmF5ICk7XG5cblx0XHR9XG5cblx0XHR0aGlzLmFycmF5WyBpbmRleCArIDAgXSA9IHRvSGFsZkZsb2F0KCB4ICk7XG5cdFx0dGhpcy5hcnJheVsgaW5kZXggKyAxIF0gPSB0b0hhbGZGbG9hdCggeSApO1xuXHRcdHRoaXMuYXJyYXlbIGluZGV4ICsgMiBdID0gdG9IYWxmRmxvYXQoIHogKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRYWVpXKCBpbmRleCwgeCwgeSwgeiwgdyApIHtcblxuXHRcdGluZGV4ICo9IHRoaXMuaXRlbVNpemU7XG5cblx0XHRpZiAoIHRoaXMubm9ybWFsaXplZCApIHtcblxuXHRcdFx0eCA9IG5vcm1hbGl6ZSggeCwgdGhpcy5hcnJheSApO1xuXHRcdFx0eSA9IG5vcm1hbGl6ZSggeSwgdGhpcy5hcnJheSApO1xuXHRcdFx0eiA9IG5vcm1hbGl6ZSggeiwgdGhpcy5hcnJheSApO1xuXHRcdFx0dyA9IG5vcm1hbGl6ZSggdywgdGhpcy5hcnJheSApO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5hcnJheVsgaW5kZXggKyAwIF0gPSB0b0hhbGZGbG9hdCggeCApO1xuXHRcdHRoaXMuYXJyYXlbIGluZGV4ICsgMSBdID0gdG9IYWxmRmxvYXQoIHkgKTtcblx0XHR0aGlzLmFycmF5WyBpbmRleCArIDIgXSA9IHRvSGFsZkZsb2F0KCB6ICk7XG5cdFx0dGhpcy5hcnJheVsgaW5kZXggKyAzIF0gPSB0b0hhbGZGbG9hdCggdyApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG59XG5cblxuY2xhc3MgRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSBleHRlbmRzIEJ1ZmZlckF0dHJpYnV0ZSB7XG5cblx0Y29uc3RydWN0b3IoIGFycmF5LCBpdGVtU2l6ZSwgbm9ybWFsaXplZCApIHtcblxuXHRcdHN1cGVyKCBuZXcgRmxvYXQzMkFycmF5KCBhcnJheSApLCBpdGVtU2l6ZSwgbm9ybWFsaXplZCApO1xuXG5cdH1cblxufVxuXG5jbGFzcyBGbG9hdDY0QnVmZmVyQXR0cmlidXRlIGV4dGVuZHMgQnVmZmVyQXR0cmlidXRlIHtcblxuXHRjb25zdHJ1Y3RvciggYXJyYXksIGl0ZW1TaXplLCBub3JtYWxpemVkICkge1xuXG5cdFx0c3VwZXIoIG5ldyBGbG9hdDY0QXJyYXkoIGFycmF5ICksIGl0ZW1TaXplLCBub3JtYWxpemVkICk7XG5cblx0fVxuXG59XG5cbi8vXG5cbmV4cG9ydCB7XG5cdEZsb2F0NjRCdWZmZXJBdHRyaWJ1dGUsXG5cdEZsb2F0MzJCdWZmZXJBdHRyaWJ1dGUsXG5cdEZsb2F0MTZCdWZmZXJBdHRyaWJ1dGUsXG5cdFVpbnQzMkJ1ZmZlckF0dHJpYnV0ZSxcblx0SW50MzJCdWZmZXJBdHRyaWJ1dGUsXG5cdFVpbnQxNkJ1ZmZlckF0dHJpYnV0ZSxcblx0SW50MTZCdWZmZXJBdHRyaWJ1dGUsXG5cdFVpbnQ4Q2xhbXBlZEJ1ZmZlckF0dHJpYnV0ZSxcblx0VWludDhCdWZmZXJBdHRyaWJ1dGUsXG5cdEludDhCdWZmZXJBdHRyaWJ1dGUsXG5cdEJ1ZmZlckF0dHJpYnV0ZVxufTtcbiIsImltcG9ydCB7IFZlY3RvcjMgfSBmcm9tICcuL1ZlY3RvcjMuanMnO1xuXG5jbGFzcyBCb3gzIHtcblxuXHRjb25zdHJ1Y3RvciggbWluID0gbmV3IFZlY3RvcjMoICsgSW5maW5pdHksICsgSW5maW5pdHksICsgSW5maW5pdHkgKSwgbWF4ID0gbmV3IFZlY3RvcjMoIC0gSW5maW5pdHksIC0gSW5maW5pdHksIC0gSW5maW5pdHkgKSApIHtcblxuXHRcdHRoaXMuaXNCb3gzID0gdHJ1ZTtcblxuXHRcdHRoaXMubWluID0gbWluO1xuXHRcdHRoaXMubWF4ID0gbWF4O1xuXG5cdH1cblxuXHRzZXQoIG1pbiwgbWF4ICkge1xuXG5cdFx0dGhpcy5taW4uY29weSggbWluICk7XG5cdFx0dGhpcy5tYXguY29weSggbWF4ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0RnJvbUFycmF5KCBhcnJheSApIHtcblxuXHRcdHRoaXMubWFrZUVtcHR5KCk7XG5cblx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gYXJyYXkubGVuZ3RoOyBpIDwgaWw7IGkgKz0gMyApIHtcblxuXHRcdFx0dGhpcy5leHBhbmRCeVBvaW50KCBfdmVjdG9yLmZyb21BcnJheSggYXJyYXksIGkgKSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21CdWZmZXJBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApIHtcblxuXHRcdHRoaXMubWFrZUVtcHR5KCk7XG5cblx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gYXR0cmlidXRlLmNvdW50OyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdHRoaXMuZXhwYW5kQnlQb2ludCggX3ZlY3Rvci5mcm9tQnVmZmVyQXR0cmlidXRlKCBhdHRyaWJ1dGUsIGkgKSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21Qb2ludHMoIHBvaW50cyApIHtcblxuXHRcdHRoaXMubWFrZUVtcHR5KCk7XG5cblx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gcG9pbnRzLmxlbmd0aDsgaSA8IGlsOyBpICsrICkge1xuXG5cdFx0XHR0aGlzLmV4cGFuZEJ5UG9pbnQoIHBvaW50c1sgaSBdICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0RnJvbUNlbnRlckFuZFNpemUoIGNlbnRlciwgc2l6ZSApIHtcblxuXHRcdGNvbnN0IGhhbGZTaXplID0gX3ZlY3Rvci5jb3B5KCBzaXplICkubXVsdGlwbHlTY2FsYXIoIDAuNSApO1xuXG5cdFx0dGhpcy5taW4uY29weSggY2VudGVyICkuc3ViKCBoYWxmU2l6ZSApO1xuXHRcdHRoaXMubWF4LmNvcHkoIGNlbnRlciApLmFkZCggaGFsZlNpemUgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRGcm9tT2JqZWN0KCBvYmplY3QsIHByZWNpc2UgPSBmYWxzZSApIHtcblxuXHRcdHRoaXMubWFrZUVtcHR5KCk7XG5cblx0XHRyZXR1cm4gdGhpcy5leHBhbmRCeU9iamVjdCggb2JqZWN0LCBwcmVjaXNlICk7XG5cblx0fVxuXG5cdGNsb25lKCkge1xuXG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCkuY29weSggdGhpcyApO1xuXG5cdH1cblxuXHRjb3B5KCBib3ggKSB7XG5cblx0XHR0aGlzLm1pbi5jb3B5KCBib3gubWluICk7XG5cdFx0dGhpcy5tYXguY29weSggYm94Lm1heCApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG1ha2VFbXB0eSgpIHtcblxuXHRcdHRoaXMubWluLnggPSB0aGlzLm1pbi55ID0gdGhpcy5taW4ueiA9ICsgSW5maW5pdHk7XG5cdFx0dGhpcy5tYXgueCA9IHRoaXMubWF4LnkgPSB0aGlzLm1heC56ID0gLSBJbmZpbml0eTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRpc0VtcHR5KCkge1xuXG5cdFx0Ly8gdGhpcyBpcyBhIG1vcmUgcm9idXN0IGNoZWNrIGZvciBlbXB0eSB0aGFuICggdm9sdW1lIDw9IDAgKSBiZWNhdXNlIHZvbHVtZSBjYW4gZ2V0IHBvc2l0aXZlIHdpdGggdHdvIG5lZ2F0aXZlIGF4ZXNcblxuXHRcdHJldHVybiAoIHRoaXMubWF4LnggPCB0aGlzLm1pbi54ICkgfHwgKCB0aGlzLm1heC55IDwgdGhpcy5taW4ueSApIHx8ICggdGhpcy5tYXgueiA8IHRoaXMubWluLnogKTtcblxuXHR9XG5cblx0Z2V0Q2VudGVyKCB0YXJnZXQgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5pc0VtcHR5KCkgPyB0YXJnZXQuc2V0KCAwLCAwLCAwICkgOiB0YXJnZXQuYWRkVmVjdG9ycyggdGhpcy5taW4sIHRoaXMubWF4ICkubXVsdGlwbHlTY2FsYXIoIDAuNSApO1xuXG5cdH1cblxuXHRnZXRTaXplKCB0YXJnZXQgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5pc0VtcHR5KCkgPyB0YXJnZXQuc2V0KCAwLCAwLCAwICkgOiB0YXJnZXQuc3ViVmVjdG9ycyggdGhpcy5tYXgsIHRoaXMubWluICk7XG5cblx0fVxuXG5cdGV4cGFuZEJ5UG9pbnQoIHBvaW50ICkge1xuXG5cdFx0dGhpcy5taW4ubWluKCBwb2ludCApO1xuXHRcdHRoaXMubWF4Lm1heCggcG9pbnQgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRleHBhbmRCeVZlY3RvciggdmVjdG9yICkge1xuXG5cdFx0dGhpcy5taW4uc3ViKCB2ZWN0b3IgKTtcblx0XHR0aGlzLm1heC5hZGQoIHZlY3RvciApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGV4cGFuZEJ5U2NhbGFyKCBzY2FsYXIgKSB7XG5cblx0XHR0aGlzLm1pbi5hZGRTY2FsYXIoIC0gc2NhbGFyICk7XG5cdFx0dGhpcy5tYXguYWRkU2NhbGFyKCBzY2FsYXIgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRleHBhbmRCeU9iamVjdCggb2JqZWN0LCBwcmVjaXNlID0gZmFsc2UgKSB7XG5cblx0XHQvLyBDb21wdXRlcyB0aGUgd29ybGQtYXhpcy1hbGlnbmVkIGJvdW5kaW5nIGJveCBvZiBhbiBvYmplY3QgKGluY2x1ZGluZyBpdHMgY2hpbGRyZW4pLFxuXHRcdC8vIGFjY291bnRpbmcgZm9yIGJvdGggdGhlIG9iamVjdCdzLCBhbmQgY2hpbGRyZW4ncywgd29ybGQgdHJhbnNmb3Jtc1xuXG5cdFx0b2JqZWN0LnVwZGF0ZVdvcmxkTWF0cml4KCBmYWxzZSwgZmFsc2UgKTtcblxuXHRcdGlmICggb2JqZWN0LmJvdW5kaW5nQm94ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGlmICggb2JqZWN0LmJvdW5kaW5nQm94ID09PSBudWxsICkge1xuXG5cdFx0XHRcdG9iamVjdC5jb21wdXRlQm91bmRpbmdCb3goKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRfYm94LmNvcHkoIG9iamVjdC5ib3VuZGluZ0JveCApO1xuXHRcdFx0X2JveC5hcHBseU1hdHJpeDQoIG9iamVjdC5tYXRyaXhXb3JsZCApO1xuXG5cdFx0XHR0aGlzLnVuaW9uKCBfYm94ICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRjb25zdCBnZW9tZXRyeSA9IG9iamVjdC5nZW9tZXRyeTtcblxuXHRcdFx0aWYgKCBnZW9tZXRyeSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdGlmICggcHJlY2lzZSAmJiBnZW9tZXRyeS5hdHRyaWJ1dGVzICE9PSB1bmRlZmluZWQgJiYgZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbiAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgcG9zaXRpb24gPSBnZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uO1xuXHRcdFx0XHRcdGZvciAoIGxldCBpID0gMCwgbCA9IHBvc2l0aW9uLmNvdW50OyBpIDwgbDsgaSArKyApIHtcblxuXHRcdFx0XHRcdFx0X3ZlY3Rvci5mcm9tQnVmZmVyQXR0cmlidXRlKCBwb3NpdGlvbiwgaSApLmFwcGx5TWF0cml4NCggb2JqZWN0Lm1hdHJpeFdvcmxkICk7XG5cdFx0XHRcdFx0XHR0aGlzLmV4cGFuZEJ5UG9pbnQoIF92ZWN0b3IgKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0aWYgKCBnZW9tZXRyeS5ib3VuZGluZ0JveCA9PT0gbnVsbCApIHtcblxuXHRcdFx0XHRcdFx0Z2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nQm94KCk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRfYm94LmNvcHkoIGdlb21ldHJ5LmJvdW5kaW5nQm94ICk7XG5cdFx0XHRcdFx0X2JveC5hcHBseU1hdHJpeDQoIG9iamVjdC5tYXRyaXhXb3JsZCApO1xuXG5cdFx0XHRcdFx0dGhpcy51bmlvbiggX2JveCApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0Y29uc3QgY2hpbGRyZW4gPSBvYmplY3QuY2hpbGRyZW47XG5cblx0XHRmb3IgKCBsZXQgaSA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHR0aGlzLmV4cGFuZEJ5T2JqZWN0KCBjaGlsZHJlblsgaSBdLCBwcmVjaXNlICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y29udGFpbnNQb2ludCggcG9pbnQgKSB7XG5cblx0XHRyZXR1cm4gcG9pbnQueCA8IHRoaXMubWluLnggfHwgcG9pbnQueCA+IHRoaXMubWF4LnggfHxcblx0XHRcdHBvaW50LnkgPCB0aGlzLm1pbi55IHx8IHBvaW50LnkgPiB0aGlzLm1heC55IHx8XG5cdFx0XHRwb2ludC56IDwgdGhpcy5taW4ueiB8fCBwb2ludC56ID4gdGhpcy5tYXgueiA/IGZhbHNlIDogdHJ1ZTtcblxuXHR9XG5cblx0Y29udGFpbnNCb3goIGJveCApIHtcblxuXHRcdHJldHVybiB0aGlzLm1pbi54IDw9IGJveC5taW4ueCAmJiBib3gubWF4LnggPD0gdGhpcy5tYXgueCAmJlxuXHRcdFx0dGhpcy5taW4ueSA8PSBib3gubWluLnkgJiYgYm94Lm1heC55IDw9IHRoaXMubWF4LnkgJiZcblx0XHRcdHRoaXMubWluLnogPD0gYm94Lm1pbi56ICYmIGJveC5tYXgueiA8PSB0aGlzLm1heC56O1xuXG5cdH1cblxuXHRnZXRQYXJhbWV0ZXIoIHBvaW50LCB0YXJnZXQgKSB7XG5cblx0XHQvLyBUaGlzIGNhbiBwb3RlbnRpYWxseSBoYXZlIGEgZGl2aWRlIGJ5IHplcm8gaWYgdGhlIGJveFxuXHRcdC8vIGhhcyBhIHNpemUgZGltZW5zaW9uIG9mIDAuXG5cblx0XHRyZXR1cm4gdGFyZ2V0LnNldChcblx0XHRcdCggcG9pbnQueCAtIHRoaXMubWluLnggKSAvICggdGhpcy5tYXgueCAtIHRoaXMubWluLnggKSxcblx0XHRcdCggcG9pbnQueSAtIHRoaXMubWluLnkgKSAvICggdGhpcy5tYXgueSAtIHRoaXMubWluLnkgKSxcblx0XHRcdCggcG9pbnQueiAtIHRoaXMubWluLnogKSAvICggdGhpcy5tYXgueiAtIHRoaXMubWluLnogKVxuXHRcdCk7XG5cblx0fVxuXG5cdGludGVyc2VjdHNCb3goIGJveCApIHtcblxuXHRcdC8vIHVzaW5nIDYgc3BsaXR0aW5nIHBsYW5lcyB0byBydWxlIG91dCBpbnRlcnNlY3Rpb25zLlxuXHRcdHJldHVybiBib3gubWF4LnggPCB0aGlzLm1pbi54IHx8IGJveC5taW4ueCA+IHRoaXMubWF4LnggfHxcblx0XHRcdGJveC5tYXgueSA8IHRoaXMubWluLnkgfHwgYm94Lm1pbi55ID4gdGhpcy5tYXgueSB8fFxuXHRcdFx0Ym94Lm1heC56IDwgdGhpcy5taW4ueiB8fCBib3gubWluLnogPiB0aGlzLm1heC56ID8gZmFsc2UgOiB0cnVlO1xuXG5cdH1cblxuXHRpbnRlcnNlY3RzU3BoZXJlKCBzcGhlcmUgKSB7XG5cblx0XHQvLyBGaW5kIHRoZSBwb2ludCBvbiB0aGUgQUFCQiBjbG9zZXN0IHRvIHRoZSBzcGhlcmUgY2VudGVyLlxuXHRcdHRoaXMuY2xhbXBQb2ludCggc3BoZXJlLmNlbnRlciwgX3ZlY3RvciApO1xuXG5cdFx0Ly8gSWYgdGhhdCBwb2ludCBpcyBpbnNpZGUgdGhlIHNwaGVyZSwgdGhlIEFBQkIgYW5kIHNwaGVyZSBpbnRlcnNlY3QuXG5cdFx0cmV0dXJuIF92ZWN0b3IuZGlzdGFuY2VUb1NxdWFyZWQoIHNwaGVyZS5jZW50ZXIgKSA8PSAoIHNwaGVyZS5yYWRpdXMgKiBzcGhlcmUucmFkaXVzICk7XG5cblx0fVxuXG5cdGludGVyc2VjdHNQbGFuZSggcGxhbmUgKSB7XG5cblx0XHQvLyBXZSBjb21wdXRlIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIGRvdCBwcm9kdWN0IHZhbHVlcy4gSWYgdGhvc2UgdmFsdWVzXG5cdFx0Ly8gYXJlIG9uIHRoZSBzYW1lIHNpZGUgKGJhY2sgb3IgZnJvbnQpIG9mIHRoZSBwbGFuZSwgdGhlbiB0aGVyZSBpcyBubyBpbnRlcnNlY3Rpb24uXG5cblx0XHRsZXQgbWluLCBtYXg7XG5cblx0XHRpZiAoIHBsYW5lLm5vcm1hbC54ID4gMCApIHtcblxuXHRcdFx0bWluID0gcGxhbmUubm9ybWFsLnggKiB0aGlzLm1pbi54O1xuXHRcdFx0bWF4ID0gcGxhbmUubm9ybWFsLnggKiB0aGlzLm1heC54O1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0bWluID0gcGxhbmUubm9ybWFsLnggKiB0aGlzLm1heC54O1xuXHRcdFx0bWF4ID0gcGxhbmUubm9ybWFsLnggKiB0aGlzLm1pbi54O1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBwbGFuZS5ub3JtYWwueSA+IDAgKSB7XG5cblx0XHRcdG1pbiArPSBwbGFuZS5ub3JtYWwueSAqIHRoaXMubWluLnk7XG5cdFx0XHRtYXggKz0gcGxhbmUubm9ybWFsLnkgKiB0aGlzLm1heC55O1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0bWluICs9IHBsYW5lLm5vcm1hbC55ICogdGhpcy5tYXgueTtcblx0XHRcdG1heCArPSBwbGFuZS5ub3JtYWwueSAqIHRoaXMubWluLnk7XG5cblx0XHR9XG5cblx0XHRpZiAoIHBsYW5lLm5vcm1hbC56ID4gMCApIHtcblxuXHRcdFx0bWluICs9IHBsYW5lLm5vcm1hbC56ICogdGhpcy5taW4uejtcblx0XHRcdG1heCArPSBwbGFuZS5ub3JtYWwueiAqIHRoaXMubWF4Lno7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRtaW4gKz0gcGxhbmUubm9ybWFsLnogKiB0aGlzLm1heC56O1xuXHRcdFx0bWF4ICs9IHBsYW5lLm5vcm1hbC56ICogdGhpcy5taW4uejtcblxuXHRcdH1cblxuXHRcdHJldHVybiAoIG1pbiA8PSAtIHBsYW5lLmNvbnN0YW50ICYmIG1heCA+PSAtIHBsYW5lLmNvbnN0YW50ICk7XG5cblx0fVxuXG5cdGludGVyc2VjdHNUcmlhbmdsZSggdHJpYW5nbGUgKSB7XG5cblx0XHRpZiAoIHRoaXMuaXNFbXB0eSgpICkge1xuXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9XG5cblx0XHQvLyBjb21wdXRlIGJveCBjZW50ZXIgYW5kIGV4dGVudHNcblx0XHR0aGlzLmdldENlbnRlciggX2NlbnRlciApO1xuXHRcdF9leHRlbnRzLnN1YlZlY3RvcnMoIHRoaXMubWF4LCBfY2VudGVyICk7XG5cblx0XHQvLyB0cmFuc2xhdGUgdHJpYW5nbGUgdG8gYWFiYiBvcmlnaW5cblx0XHRfdjAuc3ViVmVjdG9ycyggdHJpYW5nbGUuYSwgX2NlbnRlciApO1xuXHRcdF92MS5zdWJWZWN0b3JzKCB0cmlhbmdsZS5iLCBfY2VudGVyICk7XG5cdFx0X3YyLnN1YlZlY3RvcnMoIHRyaWFuZ2xlLmMsIF9jZW50ZXIgKTtcblxuXHRcdC8vIGNvbXB1dGUgZWRnZSB2ZWN0b3JzIGZvciB0cmlhbmdsZVxuXHRcdF9mMC5zdWJWZWN0b3JzKCBfdjEsIF92MCApO1xuXHRcdF9mMS5zdWJWZWN0b3JzKCBfdjIsIF92MSApO1xuXHRcdF9mMi5zdWJWZWN0b3JzKCBfdjAsIF92MiApO1xuXG5cdFx0Ly8gdGVzdCBhZ2FpbnN0IGF4ZXMgdGhhdCBhcmUgZ2l2ZW4gYnkgY3Jvc3MgcHJvZHVjdCBjb21iaW5hdGlvbnMgb2YgdGhlIGVkZ2VzIG9mIHRoZSB0cmlhbmdsZSBhbmQgdGhlIGVkZ2VzIG9mIHRoZSBhYWJiXG5cdFx0Ly8gbWFrZSBhbiBheGlzIHRlc3Rpbmcgb2YgZWFjaCBvZiB0aGUgMyBzaWRlcyBvZiB0aGUgYWFiYiBhZ2FpbnN0IGVhY2ggb2YgdGhlIDMgc2lkZXMgb2YgdGhlIHRyaWFuZ2xlID0gOSBheGlzIG9mIHNlcGFyYXRpb25cblx0XHQvLyBheGlzX2lqID0gdV9pIHggZl9qICh1MCwgdTEsIHUyID0gZmFjZSBub3JtYWxzIG9mIGFhYmIgPSB4LHkseiBheGVzIHZlY3RvcnMgc2luY2UgYWFiYiBpcyBheGlzIGFsaWduZWQpXG5cdFx0bGV0IGF4ZXMgPSBbXG5cdFx0XHQwLCAtIF9mMC56LCBfZjAueSwgMCwgLSBfZjEueiwgX2YxLnksIDAsIC0gX2YyLnosIF9mMi55LFxuXHRcdFx0X2YwLnosIDAsIC0gX2YwLngsIF9mMS56LCAwLCAtIF9mMS54LCBfZjIueiwgMCwgLSBfZjIueCxcblx0XHRcdC0gX2YwLnksIF9mMC54LCAwLCAtIF9mMS55LCBfZjEueCwgMCwgLSBfZjIueSwgX2YyLngsIDBcblx0XHRdO1xuXHRcdGlmICggISBzYXRGb3JBeGVzKCBheGVzLCBfdjAsIF92MSwgX3YyLCBfZXh0ZW50cyApICkge1xuXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9XG5cblx0XHQvLyB0ZXN0IDMgZmFjZSBub3JtYWxzIGZyb20gdGhlIGFhYmJcblx0XHRheGVzID0gWyAxLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAxIF07XG5cdFx0aWYgKCAhIHNhdEZvckF4ZXMoIGF4ZXMsIF92MCwgX3YxLCBfdjIsIF9leHRlbnRzICkgKSB7XG5cblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH1cblxuXHRcdC8vIGZpbmFsbHkgdGVzdGluZyB0aGUgZmFjZSBub3JtYWwgb2YgdGhlIHRyaWFuZ2xlXG5cdFx0Ly8gdXNlIGFscmVhZHkgZXhpc3RpbmcgdHJpYW5nbGUgZWRnZSB2ZWN0b3JzIGhlcmVcblx0XHRfdHJpYW5nbGVOb3JtYWwuY3Jvc3NWZWN0b3JzKCBfZjAsIF9mMSApO1xuXHRcdGF4ZXMgPSBbIF90cmlhbmdsZU5vcm1hbC54LCBfdHJpYW5nbGVOb3JtYWwueSwgX3RyaWFuZ2xlTm9ybWFsLnogXTtcblxuXHRcdHJldHVybiBzYXRGb3JBeGVzKCBheGVzLCBfdjAsIF92MSwgX3YyLCBfZXh0ZW50cyApO1xuXG5cdH1cblxuXHRjbGFtcFBvaW50KCBwb2ludCwgdGFyZ2V0ICkge1xuXG5cdFx0cmV0dXJuIHRhcmdldC5jb3B5KCBwb2ludCApLmNsYW1wKCB0aGlzLm1pbiwgdGhpcy5tYXggKTtcblxuXHR9XG5cblx0ZGlzdGFuY2VUb1BvaW50KCBwb2ludCApIHtcblxuXHRcdHJldHVybiB0aGlzLmNsYW1wUG9pbnQoIHBvaW50LCBfdmVjdG9yICkuZGlzdGFuY2VUbyggcG9pbnQgKTtcblxuXHR9XG5cblx0Z2V0Qm91bmRpbmdTcGhlcmUoIHRhcmdldCApIHtcblxuXHRcdGlmICggdGhpcy5pc0VtcHR5KCkgKSB7XG5cblx0XHRcdHRhcmdldC5tYWtlRW1wdHkoKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHRoaXMuZ2V0Q2VudGVyKCB0YXJnZXQuY2VudGVyICk7XG5cblx0XHRcdHRhcmdldC5yYWRpdXMgPSB0aGlzLmdldFNpemUoIF92ZWN0b3IgKS5sZW5ndGgoKSAqIDAuNTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0YXJnZXQ7XG5cblx0fVxuXG5cdGludGVyc2VjdCggYm94ICkge1xuXG5cdFx0dGhpcy5taW4ubWF4KCBib3gubWluICk7XG5cdFx0dGhpcy5tYXgubWluKCBib3gubWF4ICk7XG5cblx0XHQvLyBlbnN1cmUgdGhhdCBpZiB0aGVyZSBpcyBubyBvdmVybGFwLCB0aGUgcmVzdWx0IGlzIGZ1bGx5IGVtcHR5LCBub3Qgc2xpZ2h0bHkgZW1wdHkgd2l0aCBub24taW5mLytpbmYgdmFsdWVzIHRoYXQgd2lsbCBjYXVzZSBzdWJzZXF1ZW5jZSBpbnRlcnNlY3RzIHRvIGVycm9uZW91c2x5IHJldHVybiB2YWxpZCB2YWx1ZXMuXG5cdFx0aWYgKCB0aGlzLmlzRW1wdHkoKSApIHRoaXMubWFrZUVtcHR5KCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0dW5pb24oIGJveCApIHtcblxuXHRcdHRoaXMubWluLm1pbiggYm94Lm1pbiApO1xuXHRcdHRoaXMubWF4Lm1heCggYm94Lm1heCApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGFwcGx5TWF0cml4NCggbWF0cml4ICkge1xuXG5cdFx0Ly8gdHJhbnNmb3JtIG9mIGVtcHR5IGJveCBpcyBhbiBlbXB0eSBib3guXG5cdFx0aWYgKCB0aGlzLmlzRW1wdHkoKSApIHJldHVybiB0aGlzO1xuXG5cdFx0Ly8gTk9URTogSSBhbSB1c2luZyBhIGJpbmFyeSBwYXR0ZXJuIHRvIHNwZWNpZnkgYWxsIDJeMyBjb21iaW5hdGlvbnMgYmVsb3dcblx0XHRfcG9pbnRzWyAwIF0uc2V0KCB0aGlzLm1pbi54LCB0aGlzLm1pbi55LCB0aGlzLm1pbi56ICkuYXBwbHlNYXRyaXg0KCBtYXRyaXggKTsgLy8gMDAwXG5cdFx0X3BvaW50c1sgMSBdLnNldCggdGhpcy5taW4ueCwgdGhpcy5taW4ueSwgdGhpcy5tYXgueiApLmFwcGx5TWF0cml4NCggbWF0cml4ICk7IC8vIDAwMVxuXHRcdF9wb2ludHNbIDIgXS5zZXQoIHRoaXMubWluLngsIHRoaXMubWF4LnksIHRoaXMubWluLnogKS5hcHBseU1hdHJpeDQoIG1hdHJpeCApOyAvLyAwMTBcblx0XHRfcG9pbnRzWyAzIF0uc2V0KCB0aGlzLm1pbi54LCB0aGlzLm1heC55LCB0aGlzLm1heC56ICkuYXBwbHlNYXRyaXg0KCBtYXRyaXggKTsgLy8gMDExXG5cdFx0X3BvaW50c1sgNCBdLnNldCggdGhpcy5tYXgueCwgdGhpcy5taW4ueSwgdGhpcy5taW4ueiApLmFwcGx5TWF0cml4NCggbWF0cml4ICk7IC8vIDEwMFxuXHRcdF9wb2ludHNbIDUgXS5zZXQoIHRoaXMubWF4LngsIHRoaXMubWluLnksIHRoaXMubWF4LnogKS5hcHBseU1hdHJpeDQoIG1hdHJpeCApOyAvLyAxMDFcblx0XHRfcG9pbnRzWyA2IF0uc2V0KCB0aGlzLm1heC54LCB0aGlzLm1heC55LCB0aGlzLm1pbi56ICkuYXBwbHlNYXRyaXg0KCBtYXRyaXggKTsgLy8gMTEwXG5cdFx0X3BvaW50c1sgNyBdLnNldCggdGhpcy5tYXgueCwgdGhpcy5tYXgueSwgdGhpcy5tYXgueiApLmFwcGx5TWF0cml4NCggbWF0cml4ICk7IC8vIDExMVxuXG5cdFx0dGhpcy5zZXRGcm9tUG9pbnRzKCBfcG9pbnRzICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0dHJhbnNsYXRlKCBvZmZzZXQgKSB7XG5cblx0XHR0aGlzLm1pbi5hZGQoIG9mZnNldCApO1xuXHRcdHRoaXMubWF4LmFkZCggb2Zmc2V0ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0ZXF1YWxzKCBib3ggKSB7XG5cblx0XHRyZXR1cm4gYm94Lm1pbi5lcXVhbHMoIHRoaXMubWluICkgJiYgYm94Lm1heC5lcXVhbHMoIHRoaXMubWF4ICk7XG5cblx0fVxuXG59XG5cbmNvbnN0IF9wb2ludHMgPSBbXG5cdC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoKSxcblx0LypAX19QVVJFX18qLyBuZXcgVmVjdG9yMygpLFxuXHQvKkBfX1BVUkVfXyovIG5ldyBWZWN0b3IzKCksXG5cdC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoKSxcblx0LypAX19QVVJFX18qLyBuZXcgVmVjdG9yMygpLFxuXHQvKkBfX1BVUkVfXyovIG5ldyBWZWN0b3IzKCksXG5cdC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoKSxcblx0LypAX19QVVJFX18qLyBuZXcgVmVjdG9yMygpXG5dO1xuXG5jb25zdCBfdmVjdG9yID0gLypAX19QVVJFX18qLyBuZXcgVmVjdG9yMygpO1xuXG5jb25zdCBfYm94ID0gLypAX19QVVJFX18qLyBuZXcgQm94MygpO1xuXG4vLyB0cmlhbmdsZSBjZW50ZXJlZCB2ZXJ0aWNlc1xuXG5jb25zdCBfdjAgPSAvKkBfX1BVUkVfXyovIG5ldyBWZWN0b3IzKCk7XG5jb25zdCBfdjEgPSAvKkBfX1BVUkVfXyovIG5ldyBWZWN0b3IzKCk7XG5jb25zdCBfdjIgPSAvKkBfX1BVUkVfXyovIG5ldyBWZWN0b3IzKCk7XG5cbi8vIHRyaWFuZ2xlIGVkZ2UgdmVjdG9yc1xuXG5jb25zdCBfZjAgPSAvKkBfX1BVUkVfXyovIG5ldyBWZWN0b3IzKCk7XG5jb25zdCBfZjEgPSAvKkBfX1BVUkVfXyovIG5ldyBWZWN0b3IzKCk7XG5jb25zdCBfZjIgPSAvKkBfX1BVUkVfXyovIG5ldyBWZWN0b3IzKCk7XG5cbmNvbnN0IF9jZW50ZXIgPSAvKkBfX1BVUkVfXyovIG5ldyBWZWN0b3IzKCk7XG5jb25zdCBfZXh0ZW50cyA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoKTtcbmNvbnN0IF90cmlhbmdsZU5vcm1hbCA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoKTtcbmNvbnN0IF90ZXN0QXhpcyA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoKTtcblxuZnVuY3Rpb24gc2F0Rm9yQXhlcyggYXhlcywgdjAsIHYxLCB2MiwgZXh0ZW50cyApIHtcblxuXHRmb3IgKCBsZXQgaSA9IDAsIGogPSBheGVzLmxlbmd0aCAtIDM7IGkgPD0gajsgaSArPSAzICkge1xuXG5cdFx0X3Rlc3RBeGlzLmZyb21BcnJheSggYXhlcywgaSApO1xuXHRcdC8vIHByb2plY3QgdGhlIGFhYmIgb250byB0aGUgc2VwYXJhdGluZyBheGlzXG5cdFx0Y29uc3QgciA9IGV4dGVudHMueCAqIE1hdGguYWJzKCBfdGVzdEF4aXMueCApICsgZXh0ZW50cy55ICogTWF0aC5hYnMoIF90ZXN0QXhpcy55ICkgKyBleHRlbnRzLnogKiBNYXRoLmFicyggX3Rlc3RBeGlzLnogKTtcblx0XHQvLyBwcm9qZWN0IGFsbCAzIHZlcnRpY2VzIG9mIHRoZSB0cmlhbmdsZSBvbnRvIHRoZSBzZXBhcmF0aW5nIGF4aXNcblx0XHRjb25zdCBwMCA9IHYwLmRvdCggX3Rlc3RBeGlzICk7XG5cdFx0Y29uc3QgcDEgPSB2MS5kb3QoIF90ZXN0QXhpcyApO1xuXHRcdGNvbnN0IHAyID0gdjIuZG90KCBfdGVzdEF4aXMgKTtcblx0XHQvLyBhY3R1YWwgdGVzdCwgYmFzaWNhbGx5IHNlZSBpZiBlaXRoZXIgb2YgdGhlIG1vc3QgZXh0cmVtZSBvZiB0aGUgdHJpYW5nbGUgcG9pbnRzIGludGVyc2VjdHMgclxuXHRcdGlmICggTWF0aC5tYXgoIC0gTWF0aC5tYXgoIHAwLCBwMSwgcDIgKSwgTWF0aC5taW4oIHAwLCBwMSwgcDIgKSApID4gciApIHtcblxuXHRcdFx0Ly8gcG9pbnRzIG9mIHRoZSBwcm9qZWN0ZWQgdHJpYW5nbGUgYXJlIG91dHNpZGUgdGhlIHByb2plY3RlZCBoYWxmLWxlbmd0aCBvZiB0aGUgYWFiYlxuXHRcdFx0Ly8gdGhlIGF4aXMgaXMgc2VwYXJhdGluZyBhbmQgd2UgY2FuIGV4aXRcblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH1cblxuXHR9XG5cblx0cmV0dXJuIHRydWU7XG5cbn1cblxuZXhwb3J0IHsgQm94MyB9O1xuIiwiLyoqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL2V2ZW50ZGlzcGF0Y2hlci5qcy9cbiAqL1xuXG5jbGFzcyBFdmVudERpc3BhdGNoZXIge1xuXG5cdGFkZEV2ZW50TGlzdGVuZXIoIHR5cGUsIGxpc3RlbmVyICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xuXG5cdFx0Y29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXG5cdFx0aWYgKCBsaXN0ZW5lcnNbIHR5cGUgXSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRsaXN0ZW5lcnNbIHR5cGUgXSA9IFtdO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBsaXN0ZW5lcnNbIHR5cGUgXS5pbmRleE9mKCBsaXN0ZW5lciApID09PSAtIDEgKSB7XG5cblx0XHRcdGxpc3RlbmVyc1sgdHlwZSBdLnB1c2goIGxpc3RlbmVyICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdGhhc0V2ZW50TGlzdGVuZXIoIHR5cGUsIGxpc3RlbmVyICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybiBmYWxzZTtcblxuXHRcdGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblxuXHRcdHJldHVybiBsaXN0ZW5lcnNbIHR5cGUgXSAhPT0gdW5kZWZpbmVkICYmIGxpc3RlbmVyc1sgdHlwZSBdLmluZGV4T2YoIGxpc3RlbmVyICkgIT09IC0gMTtcblxuXHR9XG5cblx0cmVtb3ZlRXZlbnRMaXN0ZW5lciggdHlwZSwgbGlzdGVuZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0Y29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXHRcdGNvbnN0IGxpc3RlbmVyQXJyYXkgPSBsaXN0ZW5lcnNbIHR5cGUgXTtcblxuXHRcdGlmICggbGlzdGVuZXJBcnJheSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRjb25zdCBpbmRleCA9IGxpc3RlbmVyQXJyYXkuaW5kZXhPZiggbGlzdGVuZXIgKTtcblxuXHRcdFx0aWYgKCBpbmRleCAhPT0gLSAxICkge1xuXG5cdFx0XHRcdGxpc3RlbmVyQXJyYXkuc3BsaWNlKCBpbmRleCwgMSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG5cdGRpc3BhdGNoRXZlbnQoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybjtcblxuXHRcdGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblx0XHRjb25zdCBsaXN0ZW5lckFycmF5ID0gbGlzdGVuZXJzWyBldmVudC50eXBlIF07XG5cblx0XHRpZiAoIGxpc3RlbmVyQXJyYXkgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0ZXZlbnQudGFyZ2V0ID0gdGhpcztcblxuXHRcdFx0Ly8gTWFrZSBhIGNvcHksIGluIGNhc2UgbGlzdGVuZXJzIGFyZSByZW1vdmVkIHdoaWxlIGl0ZXJhdGluZy5cblx0XHRcdGNvbnN0IGFycmF5ID0gbGlzdGVuZXJBcnJheS5zbGljZSggMCApO1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRcdGFycmF5WyBpIF0uY2FsbCggdGhpcywgZXZlbnQgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRldmVudC50YXJnZXQgPSBudWxsO1xuXG5cdFx0fVxuXG5cdH1cblxufVxuXG5cbmV4cG9ydCB7IEV2ZW50RGlzcGF0Y2hlciB9O1xuIiwiaW1wb3J0IHsgQm94MyB9IGZyb20gJy4vQm94My5qcyc7XG5pbXBvcnQgeyBWZWN0b3IzIH0gZnJvbSAnLi9WZWN0b3IzLmpzJztcblxuY29uc3QgX2JveCA9IC8qQF9fUFVSRV9fKi8gbmV3IEJveDMoKTtcbmNvbnN0IF92MSA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoKTtcbmNvbnN0IF92MiA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoKTtcblxuY2xhc3MgU3BoZXJlIHtcblxuXHRjb25zdHJ1Y3RvciggY2VudGVyID0gbmV3IFZlY3RvcjMoKSwgcmFkaXVzID0gLSAxICkge1xuXG5cdFx0dGhpcy5jZW50ZXIgPSBjZW50ZXI7XG5cdFx0dGhpcy5yYWRpdXMgPSByYWRpdXM7XG5cblx0fVxuXG5cdHNldCggY2VudGVyLCByYWRpdXMgKSB7XG5cblx0XHR0aGlzLmNlbnRlci5jb3B5KCBjZW50ZXIgKTtcblx0XHR0aGlzLnJhZGl1cyA9IHJhZGl1cztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRGcm9tUG9pbnRzKCBwb2ludHMsIG9wdGlvbmFsQ2VudGVyICkge1xuXG5cdFx0Y29uc3QgY2VudGVyID0gdGhpcy5jZW50ZXI7XG5cblx0XHRpZiAoIG9wdGlvbmFsQ2VudGVyICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGNlbnRlci5jb3B5KCBvcHRpb25hbENlbnRlciApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0X2JveC5zZXRGcm9tUG9pbnRzKCBwb2ludHMgKS5nZXRDZW50ZXIoIGNlbnRlciApO1xuXG5cdFx0fVxuXG5cdFx0bGV0IG1heFJhZGl1c1NxID0gMDtcblxuXHRcdGZvciAoIGxldCBpID0gMCwgaWwgPSBwb2ludHMubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdG1heFJhZGl1c1NxID0gTWF0aC5tYXgoIG1heFJhZGl1c1NxLCBjZW50ZXIuZGlzdGFuY2VUb1NxdWFyZWQoIHBvaW50c1sgaSBdICkgKTtcblxuXHRcdH1cblxuXHRcdHRoaXMucmFkaXVzID0gTWF0aC5zcXJ0KCBtYXhSYWRpdXNTcSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNvcHkoIHNwaGVyZSApIHtcblxuXHRcdHRoaXMuY2VudGVyLmNvcHkoIHNwaGVyZS5jZW50ZXIgKTtcblx0XHR0aGlzLnJhZGl1cyA9IHNwaGVyZS5yYWRpdXM7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0aXNFbXB0eSgpIHtcblxuXHRcdHJldHVybiAoIHRoaXMucmFkaXVzIDwgMCApO1xuXG5cdH1cblxuXHRtYWtlRW1wdHkoKSB7XG5cblx0XHR0aGlzLmNlbnRlci5zZXQoIDAsIDAsIDAgKTtcblx0XHR0aGlzLnJhZGl1cyA9IC0gMTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjb250YWluc1BvaW50KCBwb2ludCApIHtcblxuXHRcdHJldHVybiAoIHBvaW50LmRpc3RhbmNlVG9TcXVhcmVkKCB0aGlzLmNlbnRlciApIDw9ICggdGhpcy5yYWRpdXMgKiB0aGlzLnJhZGl1cyApICk7XG5cblx0fVxuXG5cdGRpc3RhbmNlVG9Qb2ludCggcG9pbnQgKSB7XG5cblx0XHRyZXR1cm4gKCBwb2ludC5kaXN0YW5jZVRvKCB0aGlzLmNlbnRlciApIC0gdGhpcy5yYWRpdXMgKTtcblxuXHR9XG5cblx0aW50ZXJzZWN0c1NwaGVyZSggc3BoZXJlICkge1xuXG5cdFx0Y29uc3QgcmFkaXVzU3VtID0gdGhpcy5yYWRpdXMgKyBzcGhlcmUucmFkaXVzO1xuXG5cdFx0cmV0dXJuIHNwaGVyZS5jZW50ZXIuZGlzdGFuY2VUb1NxdWFyZWQoIHRoaXMuY2VudGVyICkgPD0gKCByYWRpdXNTdW0gKiByYWRpdXNTdW0gKTtcblxuXHR9XG5cblx0aW50ZXJzZWN0c0JveCggYm94ICkge1xuXG5cdFx0cmV0dXJuIGJveC5pbnRlcnNlY3RzU3BoZXJlKCB0aGlzICk7XG5cblx0fVxuXG5cdGludGVyc2VjdHNQbGFuZSggcGxhbmUgKSB7XG5cblx0XHRyZXR1cm4gTWF0aC5hYnMoIHBsYW5lLmRpc3RhbmNlVG9Qb2ludCggdGhpcy5jZW50ZXIgKSApIDw9IHRoaXMucmFkaXVzO1xuXG5cdH1cblxuXHRjbGFtcFBvaW50KCBwb2ludCwgdGFyZ2V0ICkge1xuXG5cdFx0Y29uc3QgZGVsdGFMZW5ndGhTcSA9IHRoaXMuY2VudGVyLmRpc3RhbmNlVG9TcXVhcmVkKCBwb2ludCApO1xuXG5cdFx0dGFyZ2V0LmNvcHkoIHBvaW50ICk7XG5cblx0XHRpZiAoIGRlbHRhTGVuZ3RoU3EgPiAoIHRoaXMucmFkaXVzICogdGhpcy5yYWRpdXMgKSApIHtcblxuXHRcdFx0dGFyZ2V0LnN1YiggdGhpcy5jZW50ZXIgKS5ub3JtYWxpemUoKTtcblx0XHRcdHRhcmdldC5tdWx0aXBseVNjYWxhciggdGhpcy5yYWRpdXMgKS5hZGQoIHRoaXMuY2VudGVyICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGFyZ2V0O1xuXG5cdH1cblxuXHRnZXRCb3VuZGluZ0JveCggdGFyZ2V0ICkge1xuXG5cdFx0aWYgKCB0aGlzLmlzRW1wdHkoKSApIHtcblxuXHRcdFx0Ly8gRW1wdHkgc3BoZXJlIHByb2R1Y2VzIGVtcHR5IGJvdW5kaW5nIGJveFxuXHRcdFx0dGFyZ2V0Lm1ha2VFbXB0eSgpO1xuXHRcdFx0cmV0dXJuIHRhcmdldDtcblxuXHRcdH1cblxuXHRcdHRhcmdldC5zZXQoIHRoaXMuY2VudGVyLCB0aGlzLmNlbnRlciApO1xuXHRcdHRhcmdldC5leHBhbmRCeVNjYWxhciggdGhpcy5yYWRpdXMgKTtcblxuXHRcdHJldHVybiB0YXJnZXQ7XG5cblx0fVxuXG5cdGFwcGx5TWF0cml4NCggbWF0cml4ICkge1xuXG5cdFx0dGhpcy5jZW50ZXIuYXBwbHlNYXRyaXg0KCBtYXRyaXggKTtcblx0XHR0aGlzLnJhZGl1cyA9IHRoaXMucmFkaXVzICogbWF0cml4LmdldE1heFNjYWxlT25BeGlzKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0dHJhbnNsYXRlKCBvZmZzZXQgKSB7XG5cblx0XHR0aGlzLmNlbnRlci5hZGQoIG9mZnNldCApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGV4cGFuZEJ5UG9pbnQoIHBvaW50ICkge1xuXG5cdFx0aWYgKCB0aGlzLmlzRW1wdHkoKSApIHtcblxuXHRcdFx0dGhpcy5jZW50ZXIuY29weSggcG9pbnQgKTtcblxuXHRcdFx0dGhpcy5yYWRpdXMgPSAwO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblxuXHRcdH1cblxuXHRcdF92MS5zdWJWZWN0b3JzKCBwb2ludCwgdGhpcy5jZW50ZXIgKTtcblxuXHRcdGNvbnN0IGxlbmd0aFNxID0gX3YxLmxlbmd0aFNxKCk7XG5cblx0XHRpZiAoIGxlbmd0aFNxID4gKCB0aGlzLnJhZGl1cyAqIHRoaXMucmFkaXVzICkgKSB7XG5cblx0XHRcdC8vIGNhbGN1bGF0ZSB0aGUgbWluaW1hbCBzcGhlcmVcblxuXHRcdFx0Y29uc3QgbGVuZ3RoID0gTWF0aC5zcXJ0KCBsZW5ndGhTcSApO1xuXG5cdFx0XHRjb25zdCBkZWx0YSA9ICggbGVuZ3RoIC0gdGhpcy5yYWRpdXMgKSAqIDAuNTtcblxuXHRcdFx0dGhpcy5jZW50ZXIuYWRkU2NhbGVkVmVjdG9yKCBfdjEsIGRlbHRhIC8gbGVuZ3RoICk7XG5cblx0XHRcdHRoaXMucmFkaXVzICs9IGRlbHRhO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHVuaW9uKCBzcGhlcmUgKSB7XG5cblx0XHRpZiAoIHNwaGVyZS5pc0VtcHR5KCkgKSB7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmlzRW1wdHkoKSApIHtcblxuXHRcdFx0dGhpcy5jb3B5KCBzcGhlcmUgKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuY2VudGVyLmVxdWFscyggc3BoZXJlLmNlbnRlciApID09PSB0cnVlICkge1xuXG5cdFx0XHQgdGhpcy5yYWRpdXMgPSBNYXRoLm1heCggdGhpcy5yYWRpdXMsIHNwaGVyZS5yYWRpdXMgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdF92Mi5zdWJWZWN0b3JzKCBzcGhlcmUuY2VudGVyLCB0aGlzLmNlbnRlciApLnNldExlbmd0aCggc3BoZXJlLnJhZGl1cyApO1xuXG5cdFx0XHR0aGlzLmV4cGFuZEJ5UG9pbnQoIF92MS5jb3B5KCBzcGhlcmUuY2VudGVyICkuYWRkKCBfdjIgKSApO1xuXG5cdFx0XHR0aGlzLmV4cGFuZEJ5UG9pbnQoIF92MS5jb3B5KCBzcGhlcmUuY2VudGVyICkuc3ViKCBfdjIgKSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGVxdWFscyggc3BoZXJlICkge1xuXG5cdFx0cmV0dXJuIHNwaGVyZS5jZW50ZXIuZXF1YWxzKCB0aGlzLmNlbnRlciApICYmICggc3BoZXJlLnJhZGl1cyA9PT0gdGhpcy5yYWRpdXMgKTtcblxuXHR9XG5cblx0Y2xvbmUoKSB7XG5cblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoKS5jb3B5KCB0aGlzICk7XG5cblx0fVxuXG59XG5cbmV4cG9ydCB7IFNwaGVyZSB9O1xuIiwiaW1wb3J0IHsgV2ViR0xDb29yZGluYXRlU3lzdGVtLCBXZWJHUFVDb29yZGluYXRlU3lzdGVtIH0gZnJvbSAnLi4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IFZlY3RvcjMgfSBmcm9tICcuL1ZlY3RvcjMuanMnO1xuXG5jbGFzcyBNYXRyaXg0IHtcblxuXHRjb25zdHJ1Y3RvciggbjExLCBuMTIsIG4xMywgbjE0LCBuMjEsIG4yMiwgbjIzLCBuMjQsIG4zMSwgbjMyLCBuMzMsIG4zNCwgbjQxLCBuNDIsIG40MywgbjQ0ICkge1xuXG5cdFx0TWF0cml4NC5wcm90b3R5cGUuaXNNYXRyaXg0ID0gdHJ1ZTtcblxuXHRcdHRoaXMuZWxlbWVudHMgPSBbXG5cblx0XHRcdDEsIDAsIDAsIDAsXG5cdFx0XHQwLCAxLCAwLCAwLFxuXHRcdFx0MCwgMCwgMSwgMCxcblx0XHRcdDAsIDAsIDAsIDFcblxuXHRcdF07XG5cblx0XHRpZiAoIG4xMSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHR0aGlzLnNldCggbjExLCBuMTIsIG4xMywgbjE0LCBuMjEsIG4yMiwgbjIzLCBuMjQsIG4zMSwgbjMyLCBuMzMsIG4zNCwgbjQxLCBuNDIsIG40MywgbjQ0ICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdHNldCggbjExLCBuMTIsIG4xMywgbjE0LCBuMjEsIG4yMiwgbjIzLCBuMjQsIG4zMSwgbjMyLCBuMzMsIG4zNCwgbjQxLCBuNDIsIG40MywgbjQ0ICkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG5cdFx0dGVbIDAgXSA9IG4xMTsgdGVbIDQgXSA9IG4xMjsgdGVbIDggXSA9IG4xMzsgdGVbIDEyIF0gPSBuMTQ7XG5cdFx0dGVbIDEgXSA9IG4yMTsgdGVbIDUgXSA9IG4yMjsgdGVbIDkgXSA9IG4yMzsgdGVbIDEzIF0gPSBuMjQ7XG5cdFx0dGVbIDIgXSA9IG4zMTsgdGVbIDYgXSA9IG4zMjsgdGVbIDEwIF0gPSBuMzM7IHRlWyAxNCBdID0gbjM0O1xuXHRcdHRlWyAzIF0gPSBuNDE7IHRlWyA3IF0gPSBuNDI7IHRlWyAxMSBdID0gbjQzOyB0ZVsgMTUgXSA9IG40NDtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRpZGVudGl0eSgpIHtcblxuXHRcdHRoaXMuc2V0KFxuXG5cdFx0XHQxLCAwLCAwLCAwLFxuXHRcdFx0MCwgMSwgMCwgMCxcblx0XHRcdDAsIDAsIDEsIDAsXG5cdFx0XHQwLCAwLCAwLCAxXG5cblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNsb25lKCkge1xuXG5cdFx0cmV0dXJuIG5ldyBNYXRyaXg0KCkuZnJvbUFycmF5KCB0aGlzLmVsZW1lbnRzICk7XG5cblx0fVxuXG5cdGNvcHkoIG0gKSB7XG5cblx0XHRjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHM7XG5cdFx0Y29uc3QgbWUgPSBtLmVsZW1lbnRzO1xuXG5cdFx0dGVbIDAgXSA9IG1lWyAwIF07IHRlWyAxIF0gPSBtZVsgMSBdOyB0ZVsgMiBdID0gbWVbIDIgXTsgdGVbIDMgXSA9IG1lWyAzIF07XG5cdFx0dGVbIDQgXSA9IG1lWyA0IF07IHRlWyA1IF0gPSBtZVsgNSBdOyB0ZVsgNiBdID0gbWVbIDYgXTsgdGVbIDcgXSA9IG1lWyA3IF07XG5cdFx0dGVbIDggXSA9IG1lWyA4IF07IHRlWyA5IF0gPSBtZVsgOSBdOyB0ZVsgMTAgXSA9IG1lWyAxMCBdOyB0ZVsgMTEgXSA9IG1lWyAxMSBdO1xuXHRcdHRlWyAxMiBdID0gbWVbIDEyIF07IHRlWyAxMyBdID0gbWVbIDEzIF07IHRlWyAxNCBdID0gbWVbIDE0IF07IHRlWyAxNSBdID0gbWVbIDE1IF07XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y29weVBvc2l0aW9uKCBtICkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzLCBtZSA9IG0uZWxlbWVudHM7XG5cblx0XHR0ZVsgMTIgXSA9IG1lWyAxMiBdO1xuXHRcdHRlWyAxMyBdID0gbWVbIDEzIF07XG5cdFx0dGVbIDE0IF0gPSBtZVsgMTQgXTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRGcm9tTWF0cml4MyggbSApIHtcblxuXHRcdGNvbnN0IG1lID0gbS5lbGVtZW50cztcblxuXHRcdHRoaXMuc2V0KFxuXG5cdFx0XHRtZVsgMCBdLCBtZVsgMyBdLCBtZVsgNiBdLCAwLFxuXHRcdFx0bWVbIDEgXSwgbWVbIDQgXSwgbWVbIDcgXSwgMCxcblx0XHRcdG1lWyAyIF0sIG1lWyA1IF0sIG1lWyA4IF0sIDAsXG5cdFx0XHQwLCAwLCAwLCAxXG5cblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGV4dHJhY3RCYXNpcyggeEF4aXMsIHlBeGlzLCB6QXhpcyApIHtcblxuXHRcdHhBeGlzLnNldEZyb21NYXRyaXhDb2x1bW4oIHRoaXMsIDAgKTtcblx0XHR5QXhpcy5zZXRGcm9tTWF0cml4Q29sdW1uKCB0aGlzLCAxICk7XG5cdFx0ekF4aXMuc2V0RnJvbU1hdHJpeENvbHVtbiggdGhpcywgMiApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG1ha2VCYXNpcyggeEF4aXMsIHlBeGlzLCB6QXhpcyApIHtcblxuXHRcdHRoaXMuc2V0KFxuXHRcdFx0eEF4aXMueCwgeUF4aXMueCwgekF4aXMueCwgMCxcblx0XHRcdHhBeGlzLnksIHlBeGlzLnksIHpBeGlzLnksIDAsXG5cdFx0XHR4QXhpcy56LCB5QXhpcy56LCB6QXhpcy56LCAwLFxuXHRcdFx0MCwgMCwgMCwgMVxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0ZXh0cmFjdFJvdGF0aW9uKCBtICkge1xuXG5cdFx0Ly8gdGhpcyBtZXRob2QgZG9lcyBub3Qgc3VwcG9ydCByZWZsZWN0aW9uIG1hdHJpY2VzXG5cblx0XHRjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHM7XG5cdFx0Y29uc3QgbWUgPSBtLmVsZW1lbnRzO1xuXG5cdFx0Y29uc3Qgc2NhbGVYID0gMSAvIF92MS5zZXRGcm9tTWF0cml4Q29sdW1uKCBtLCAwICkubGVuZ3RoKCk7XG5cdFx0Y29uc3Qgc2NhbGVZID0gMSAvIF92MS5zZXRGcm9tTWF0cml4Q29sdW1uKCBtLCAxICkubGVuZ3RoKCk7XG5cdFx0Y29uc3Qgc2NhbGVaID0gMSAvIF92MS5zZXRGcm9tTWF0cml4Q29sdW1uKCBtLCAyICkubGVuZ3RoKCk7XG5cblx0XHR0ZVsgMCBdID0gbWVbIDAgXSAqIHNjYWxlWDtcblx0XHR0ZVsgMSBdID0gbWVbIDEgXSAqIHNjYWxlWDtcblx0XHR0ZVsgMiBdID0gbWVbIDIgXSAqIHNjYWxlWDtcblx0XHR0ZVsgMyBdID0gMDtcblxuXHRcdHRlWyA0IF0gPSBtZVsgNCBdICogc2NhbGVZO1xuXHRcdHRlWyA1IF0gPSBtZVsgNSBdICogc2NhbGVZO1xuXHRcdHRlWyA2IF0gPSBtZVsgNiBdICogc2NhbGVZO1xuXHRcdHRlWyA3IF0gPSAwO1xuXG5cdFx0dGVbIDggXSA9IG1lWyA4IF0gKiBzY2FsZVo7XG5cdFx0dGVbIDkgXSA9IG1lWyA5IF0gKiBzY2FsZVo7XG5cdFx0dGVbIDEwIF0gPSBtZVsgMTAgXSAqIHNjYWxlWjtcblx0XHR0ZVsgMTEgXSA9IDA7XG5cblx0XHR0ZVsgMTIgXSA9IDA7XG5cdFx0dGVbIDEzIF0gPSAwO1xuXHRcdHRlWyAxNCBdID0gMDtcblx0XHR0ZVsgMTUgXSA9IDE7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bWFrZVJvdGF0aW9uRnJvbUV1bGVyKCBldWxlciApIHtcblxuXHRcdGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcblxuXHRcdGNvbnN0IHggPSBldWxlci54LCB5ID0gZXVsZXIueSwgeiA9IGV1bGVyLno7XG5cdFx0Y29uc3QgYSA9IE1hdGguY29zKCB4ICksIGIgPSBNYXRoLnNpbiggeCApO1xuXHRcdGNvbnN0IGMgPSBNYXRoLmNvcyggeSApLCBkID0gTWF0aC5zaW4oIHkgKTtcblx0XHRjb25zdCBlID0gTWF0aC5jb3MoIHogKSwgZiA9IE1hdGguc2luKCB6ICk7XG5cblx0XHRpZiAoIGV1bGVyLm9yZGVyID09PSAnWFlaJyApIHtcblxuXHRcdFx0Y29uc3QgYWUgPSBhICogZSwgYWYgPSBhICogZiwgYmUgPSBiICogZSwgYmYgPSBiICogZjtcblxuXHRcdFx0dGVbIDAgXSA9IGMgKiBlO1xuXHRcdFx0dGVbIDQgXSA9IC0gYyAqIGY7XG5cdFx0XHR0ZVsgOCBdID0gZDtcblxuXHRcdFx0dGVbIDEgXSA9IGFmICsgYmUgKiBkO1xuXHRcdFx0dGVbIDUgXSA9IGFlIC0gYmYgKiBkO1xuXHRcdFx0dGVbIDkgXSA9IC0gYiAqIGM7XG5cblx0XHRcdHRlWyAyIF0gPSBiZiAtIGFlICogZDtcblx0XHRcdHRlWyA2IF0gPSBiZSArIGFmICogZDtcblx0XHRcdHRlWyAxMCBdID0gYSAqIGM7XG5cblx0XHR9IGVsc2UgaWYgKCBldWxlci5vcmRlciA9PT0gJ1lYWicgKSB7XG5cblx0XHRcdGNvbnN0IGNlID0gYyAqIGUsIGNmID0gYyAqIGYsIGRlID0gZCAqIGUsIGRmID0gZCAqIGY7XG5cblx0XHRcdHRlWyAwIF0gPSBjZSArIGRmICogYjtcblx0XHRcdHRlWyA0IF0gPSBkZSAqIGIgLSBjZjtcblx0XHRcdHRlWyA4IF0gPSBhICogZDtcblxuXHRcdFx0dGVbIDEgXSA9IGEgKiBmO1xuXHRcdFx0dGVbIDUgXSA9IGEgKiBlO1xuXHRcdFx0dGVbIDkgXSA9IC0gYjtcblxuXHRcdFx0dGVbIDIgXSA9IGNmICogYiAtIGRlO1xuXHRcdFx0dGVbIDYgXSA9IGRmICsgY2UgKiBiO1xuXHRcdFx0dGVbIDEwIF0gPSBhICogYztcblxuXHRcdH0gZWxzZSBpZiAoIGV1bGVyLm9yZGVyID09PSAnWlhZJyApIHtcblxuXHRcdFx0Y29uc3QgY2UgPSBjICogZSwgY2YgPSBjICogZiwgZGUgPSBkICogZSwgZGYgPSBkICogZjtcblxuXHRcdFx0dGVbIDAgXSA9IGNlIC0gZGYgKiBiO1xuXHRcdFx0dGVbIDQgXSA9IC0gYSAqIGY7XG5cdFx0XHR0ZVsgOCBdID0gZGUgKyBjZiAqIGI7XG5cblx0XHRcdHRlWyAxIF0gPSBjZiArIGRlICogYjtcblx0XHRcdHRlWyA1IF0gPSBhICogZTtcblx0XHRcdHRlWyA5IF0gPSBkZiAtIGNlICogYjtcblxuXHRcdFx0dGVbIDIgXSA9IC0gYSAqIGQ7XG5cdFx0XHR0ZVsgNiBdID0gYjtcblx0XHRcdHRlWyAxMCBdID0gYSAqIGM7XG5cblx0XHR9IGVsc2UgaWYgKCBldWxlci5vcmRlciA9PT0gJ1pZWCcgKSB7XG5cblx0XHRcdGNvbnN0IGFlID0gYSAqIGUsIGFmID0gYSAqIGYsIGJlID0gYiAqIGUsIGJmID0gYiAqIGY7XG5cblx0XHRcdHRlWyAwIF0gPSBjICogZTtcblx0XHRcdHRlWyA0IF0gPSBiZSAqIGQgLSBhZjtcblx0XHRcdHRlWyA4IF0gPSBhZSAqIGQgKyBiZjtcblxuXHRcdFx0dGVbIDEgXSA9IGMgKiBmO1xuXHRcdFx0dGVbIDUgXSA9IGJmICogZCArIGFlO1xuXHRcdFx0dGVbIDkgXSA9IGFmICogZCAtIGJlO1xuXG5cdFx0XHR0ZVsgMiBdID0gLSBkO1xuXHRcdFx0dGVbIDYgXSA9IGIgKiBjO1xuXHRcdFx0dGVbIDEwIF0gPSBhICogYztcblxuXHRcdH0gZWxzZSBpZiAoIGV1bGVyLm9yZGVyID09PSAnWVpYJyApIHtcblxuXHRcdFx0Y29uc3QgYWMgPSBhICogYywgYWQgPSBhICogZCwgYmMgPSBiICogYywgYmQgPSBiICogZDtcblxuXHRcdFx0dGVbIDAgXSA9IGMgKiBlO1xuXHRcdFx0dGVbIDQgXSA9IGJkIC0gYWMgKiBmO1xuXHRcdFx0dGVbIDggXSA9IGJjICogZiArIGFkO1xuXG5cdFx0XHR0ZVsgMSBdID0gZjtcblx0XHRcdHRlWyA1IF0gPSBhICogZTtcblx0XHRcdHRlWyA5IF0gPSAtIGIgKiBlO1xuXG5cdFx0XHR0ZVsgMiBdID0gLSBkICogZTtcblx0XHRcdHRlWyA2IF0gPSBhZCAqIGYgKyBiYztcblx0XHRcdHRlWyAxMCBdID0gYWMgLSBiZCAqIGY7XG5cblx0XHR9IGVsc2UgaWYgKCBldWxlci5vcmRlciA9PT0gJ1haWScgKSB7XG5cblx0XHRcdGNvbnN0IGFjID0gYSAqIGMsIGFkID0gYSAqIGQsIGJjID0gYiAqIGMsIGJkID0gYiAqIGQ7XG5cblx0XHRcdHRlWyAwIF0gPSBjICogZTtcblx0XHRcdHRlWyA0IF0gPSAtIGY7XG5cdFx0XHR0ZVsgOCBdID0gZCAqIGU7XG5cblx0XHRcdHRlWyAxIF0gPSBhYyAqIGYgKyBiZDtcblx0XHRcdHRlWyA1IF0gPSBhICogZTtcblx0XHRcdHRlWyA5IF0gPSBhZCAqIGYgLSBiYztcblxuXHRcdFx0dGVbIDIgXSA9IGJjICogZiAtIGFkO1xuXHRcdFx0dGVbIDYgXSA9IGIgKiBlO1xuXHRcdFx0dGVbIDEwIF0gPSBiZCAqIGYgKyBhYztcblxuXHRcdH1cblxuXHRcdC8vIGJvdHRvbSByb3dcblx0XHR0ZVsgMyBdID0gMDtcblx0XHR0ZVsgNyBdID0gMDtcblx0XHR0ZVsgMTEgXSA9IDA7XG5cblx0XHQvLyBsYXN0IGNvbHVtblxuXHRcdHRlWyAxMiBdID0gMDtcblx0XHR0ZVsgMTMgXSA9IDA7XG5cdFx0dGVbIDE0IF0gPSAwO1xuXHRcdHRlWyAxNSBdID0gMTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRtYWtlUm90YXRpb25Gcm9tUXVhdGVybmlvbiggcSApIHtcblxuXHRcdHJldHVybiB0aGlzLmNvbXBvc2UoIF96ZXJvLCBxLCBfb25lICk7XG5cblx0fVxuXG5cdGxvb2tBdCggZXllLCB0YXJnZXQsIHVwICkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG5cdFx0X3ouc3ViVmVjdG9ycyggZXllLCB0YXJnZXQgKTtcblxuXHRcdGlmICggX3oubGVuZ3RoU3EoKSA9PT0gMCApIHtcblxuXHRcdFx0Ly8gZXllIGFuZCB0YXJnZXQgYXJlIGluIHRoZSBzYW1lIHBvc2l0aW9uXG5cblx0XHRcdF96LnogPSAxO1xuXG5cdFx0fVxuXG5cdFx0X3oubm9ybWFsaXplKCk7XG5cdFx0X3guY3Jvc3NWZWN0b3JzKCB1cCwgX3ogKTtcblxuXHRcdGlmICggX3gubGVuZ3RoU3EoKSA9PT0gMCApIHtcblxuXHRcdFx0Ly8gdXAgYW5kIHogYXJlIHBhcmFsbGVsXG5cblx0XHRcdGlmICggTWF0aC5hYnMoIHVwLnogKSA9PT0gMSApIHtcblxuXHRcdFx0XHRfei54ICs9IDAuMDAwMTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRfei56ICs9IDAuMDAwMTtcblxuXHRcdFx0fVxuXG5cdFx0XHRfei5ub3JtYWxpemUoKTtcblx0XHRcdF94LmNyb3NzVmVjdG9ycyggdXAsIF96ICk7XG5cblx0XHR9XG5cblx0XHRfeC5ub3JtYWxpemUoKTtcblx0XHRfeS5jcm9zc1ZlY3RvcnMoIF96LCBfeCApO1xuXG5cdFx0dGVbIDAgXSA9IF94Lng7IHRlWyA0IF0gPSBfeS54OyB0ZVsgOCBdID0gX3oueDtcblx0XHR0ZVsgMSBdID0gX3gueTsgdGVbIDUgXSA9IF95Lnk7IHRlWyA5IF0gPSBfei55O1xuXHRcdHRlWyAyIF0gPSBfeC56OyB0ZVsgNiBdID0gX3kuejsgdGVbIDEwIF0gPSBfei56O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG11bHRpcGx5KCBtICkge1xuXG5cdFx0cmV0dXJuIHRoaXMubXVsdGlwbHlNYXRyaWNlcyggdGhpcywgbSApO1xuXG5cdH1cblxuXHRwcmVtdWx0aXBseSggbSApIHtcblxuXHRcdHJldHVybiB0aGlzLm11bHRpcGx5TWF0cmljZXMoIG0sIHRoaXMgKTtcblxuXHR9XG5cblx0bXVsdGlwbHlNYXRyaWNlcyggYSwgYiApIHtcblxuXHRcdGNvbnN0IGFlID0gYS5lbGVtZW50cztcblx0XHRjb25zdCBiZSA9IGIuZWxlbWVudHM7XG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG5cdFx0Y29uc3QgYTExID0gYWVbIDAgXSwgYTEyID0gYWVbIDQgXSwgYTEzID0gYWVbIDggXSwgYTE0ID0gYWVbIDEyIF07XG5cdFx0Y29uc3QgYTIxID0gYWVbIDEgXSwgYTIyID0gYWVbIDUgXSwgYTIzID0gYWVbIDkgXSwgYTI0ID0gYWVbIDEzIF07XG5cdFx0Y29uc3QgYTMxID0gYWVbIDIgXSwgYTMyID0gYWVbIDYgXSwgYTMzID0gYWVbIDEwIF0sIGEzNCA9IGFlWyAxNCBdO1xuXHRcdGNvbnN0IGE0MSA9IGFlWyAzIF0sIGE0MiA9IGFlWyA3IF0sIGE0MyA9IGFlWyAxMSBdLCBhNDQgPSBhZVsgMTUgXTtcblxuXHRcdGNvbnN0IGIxMSA9IGJlWyAwIF0sIGIxMiA9IGJlWyA0IF0sIGIxMyA9IGJlWyA4IF0sIGIxNCA9IGJlWyAxMiBdO1xuXHRcdGNvbnN0IGIyMSA9IGJlWyAxIF0sIGIyMiA9IGJlWyA1IF0sIGIyMyA9IGJlWyA5IF0sIGIyNCA9IGJlWyAxMyBdO1xuXHRcdGNvbnN0IGIzMSA9IGJlWyAyIF0sIGIzMiA9IGJlWyA2IF0sIGIzMyA9IGJlWyAxMCBdLCBiMzQgPSBiZVsgMTQgXTtcblx0XHRjb25zdCBiNDEgPSBiZVsgMyBdLCBiNDIgPSBiZVsgNyBdLCBiNDMgPSBiZVsgMTEgXSwgYjQ0ID0gYmVbIDE1IF07XG5cblx0XHR0ZVsgMCBdID0gYTExICogYjExICsgYTEyICogYjIxICsgYTEzICogYjMxICsgYTE0ICogYjQxO1xuXHRcdHRlWyA0IF0gPSBhMTEgKiBiMTIgKyBhMTIgKiBiMjIgKyBhMTMgKiBiMzIgKyBhMTQgKiBiNDI7XG5cdFx0dGVbIDggXSA9IGExMSAqIGIxMyArIGExMiAqIGIyMyArIGExMyAqIGIzMyArIGExNCAqIGI0Mztcblx0XHR0ZVsgMTIgXSA9IGExMSAqIGIxNCArIGExMiAqIGIyNCArIGExMyAqIGIzNCArIGExNCAqIGI0NDtcblxuXHRcdHRlWyAxIF0gPSBhMjEgKiBiMTEgKyBhMjIgKiBiMjEgKyBhMjMgKiBiMzEgKyBhMjQgKiBiNDE7XG5cdFx0dGVbIDUgXSA9IGEyMSAqIGIxMiArIGEyMiAqIGIyMiArIGEyMyAqIGIzMiArIGEyNCAqIGI0Mjtcblx0XHR0ZVsgOSBdID0gYTIxICogYjEzICsgYTIyICogYjIzICsgYTIzICogYjMzICsgYTI0ICogYjQzO1xuXHRcdHRlWyAxMyBdID0gYTIxICogYjE0ICsgYTIyICogYjI0ICsgYTIzICogYjM0ICsgYTI0ICogYjQ0O1xuXG5cdFx0dGVbIDIgXSA9IGEzMSAqIGIxMSArIGEzMiAqIGIyMSArIGEzMyAqIGIzMSArIGEzNCAqIGI0MTtcblx0XHR0ZVsgNiBdID0gYTMxICogYjEyICsgYTMyICogYjIyICsgYTMzICogYjMyICsgYTM0ICogYjQyO1xuXHRcdHRlWyAxMCBdID0gYTMxICogYjEzICsgYTMyICogYjIzICsgYTMzICogYjMzICsgYTM0ICogYjQzO1xuXHRcdHRlWyAxNCBdID0gYTMxICogYjE0ICsgYTMyICogYjI0ICsgYTMzICogYjM0ICsgYTM0ICogYjQ0O1xuXG5cdFx0dGVbIDMgXSA9IGE0MSAqIGIxMSArIGE0MiAqIGIyMSArIGE0MyAqIGIzMSArIGE0NCAqIGI0MTtcblx0XHR0ZVsgNyBdID0gYTQxICogYjEyICsgYTQyICogYjIyICsgYTQzICogYjMyICsgYTQ0ICogYjQyO1xuXHRcdHRlWyAxMSBdID0gYTQxICogYjEzICsgYTQyICogYjIzICsgYTQzICogYjMzICsgYTQ0ICogYjQzO1xuXHRcdHRlWyAxNSBdID0gYTQxICogYjE0ICsgYTQyICogYjI0ICsgYTQzICogYjM0ICsgYTQ0ICogYjQ0O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG11bHRpcGx5U2NhbGFyKCBzICkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG5cdFx0dGVbIDAgXSAqPSBzOyB0ZVsgNCBdICo9IHM7IHRlWyA4IF0gKj0gczsgdGVbIDEyIF0gKj0gcztcblx0XHR0ZVsgMSBdICo9IHM7IHRlWyA1IF0gKj0gczsgdGVbIDkgXSAqPSBzOyB0ZVsgMTMgXSAqPSBzO1xuXHRcdHRlWyAyIF0gKj0gczsgdGVbIDYgXSAqPSBzOyB0ZVsgMTAgXSAqPSBzOyB0ZVsgMTQgXSAqPSBzO1xuXHRcdHRlWyAzIF0gKj0gczsgdGVbIDcgXSAqPSBzOyB0ZVsgMTEgXSAqPSBzOyB0ZVsgMTUgXSAqPSBzO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGRldGVybWluYW50KCkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG5cdFx0Y29uc3QgbjExID0gdGVbIDAgXSwgbjEyID0gdGVbIDQgXSwgbjEzID0gdGVbIDggXSwgbjE0ID0gdGVbIDEyIF07XG5cdFx0Y29uc3QgbjIxID0gdGVbIDEgXSwgbjIyID0gdGVbIDUgXSwgbjIzID0gdGVbIDkgXSwgbjI0ID0gdGVbIDEzIF07XG5cdFx0Y29uc3QgbjMxID0gdGVbIDIgXSwgbjMyID0gdGVbIDYgXSwgbjMzID0gdGVbIDEwIF0sIG4zNCA9IHRlWyAxNCBdO1xuXHRcdGNvbnN0IG40MSA9IHRlWyAzIF0sIG40MiA9IHRlWyA3IF0sIG40MyA9IHRlWyAxMSBdLCBuNDQgPSB0ZVsgMTUgXTtcblxuXHRcdC8vVE9ETzogbWFrZSB0aGlzIG1vcmUgZWZmaWNpZW50XG5cdFx0Ly8oIGJhc2VkIG9uIGh0dHA6Ly93d3cuZXVjbGlkZWFuc3BhY2UuY29tL21hdGhzL2FsZ2VicmEvbWF0cml4L2Z1bmN0aW9ucy9pbnZlcnNlL2ZvdXJEL2luZGV4Lmh0bSApXG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0bjQxICogKFxuXHRcdFx0XHQrIG4xNCAqIG4yMyAqIG4zMlxuXHRcdFx0XHQgLSBuMTMgKiBuMjQgKiBuMzJcblx0XHRcdFx0IC0gbjE0ICogbjIyICogbjMzXG5cdFx0XHRcdCArIG4xMiAqIG4yNCAqIG4zM1xuXHRcdFx0XHQgKyBuMTMgKiBuMjIgKiBuMzRcblx0XHRcdFx0IC0gbjEyICogbjIzICogbjM0XG5cdFx0XHQpICtcblx0XHRcdG40MiAqIChcblx0XHRcdFx0KyBuMTEgKiBuMjMgKiBuMzRcblx0XHRcdFx0IC0gbjExICogbjI0ICogbjMzXG5cdFx0XHRcdCArIG4xNCAqIG4yMSAqIG4zM1xuXHRcdFx0XHQgLSBuMTMgKiBuMjEgKiBuMzRcblx0XHRcdFx0ICsgbjEzICogbjI0ICogbjMxXG5cdFx0XHRcdCAtIG4xNCAqIG4yMyAqIG4zMVxuXHRcdFx0KSArXG5cdFx0XHRuNDMgKiAoXG5cdFx0XHRcdCsgbjExICogbjI0ICogbjMyXG5cdFx0XHRcdCAtIG4xMSAqIG4yMiAqIG4zNFxuXHRcdFx0XHQgLSBuMTQgKiBuMjEgKiBuMzJcblx0XHRcdFx0ICsgbjEyICogbjIxICogbjM0XG5cdFx0XHRcdCArIG4xNCAqIG4yMiAqIG4zMVxuXHRcdFx0XHQgLSBuMTIgKiBuMjQgKiBuMzFcblx0XHRcdCkgK1xuXHRcdFx0bjQ0ICogKFxuXHRcdFx0XHQtIG4xMyAqIG4yMiAqIG4zMVxuXHRcdFx0XHQgLSBuMTEgKiBuMjMgKiBuMzJcblx0XHRcdFx0ICsgbjExICogbjIyICogbjMzXG5cdFx0XHRcdCArIG4xMyAqIG4yMSAqIG4zMlxuXHRcdFx0XHQgLSBuMTIgKiBuMjEgKiBuMzNcblx0XHRcdFx0ICsgbjEyICogbjIzICogbjMxXG5cdFx0XHQpXG5cblx0XHQpO1xuXG5cdH1cblxuXHR0cmFuc3Bvc2UoKSB7XG5cblx0XHRjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHM7XG5cdFx0bGV0IHRtcDtcblxuXHRcdHRtcCA9IHRlWyAxIF07IHRlWyAxIF0gPSB0ZVsgNCBdOyB0ZVsgNCBdID0gdG1wO1xuXHRcdHRtcCA9IHRlWyAyIF07IHRlWyAyIF0gPSB0ZVsgOCBdOyB0ZVsgOCBdID0gdG1wO1xuXHRcdHRtcCA9IHRlWyA2IF07IHRlWyA2IF0gPSB0ZVsgOSBdOyB0ZVsgOSBdID0gdG1wO1xuXG5cdFx0dG1wID0gdGVbIDMgXTsgdGVbIDMgXSA9IHRlWyAxMiBdOyB0ZVsgMTIgXSA9IHRtcDtcblx0XHR0bXAgPSB0ZVsgNyBdOyB0ZVsgNyBdID0gdGVbIDEzIF07IHRlWyAxMyBdID0gdG1wO1xuXHRcdHRtcCA9IHRlWyAxMSBdOyB0ZVsgMTEgXSA9IHRlWyAxNCBdOyB0ZVsgMTQgXSA9IHRtcDtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRQb3NpdGlvbiggeCwgeSwgeiApIHtcblxuXHRcdGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcblxuXHRcdGlmICggeC5pc1ZlY3RvcjMgKSB7XG5cblx0XHRcdHRlWyAxMiBdID0geC54O1xuXHRcdFx0dGVbIDEzIF0gPSB4Lnk7XG5cdFx0XHR0ZVsgMTQgXSA9IHguejtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHRlWyAxMiBdID0geDtcblx0XHRcdHRlWyAxMyBdID0geTtcblx0XHRcdHRlWyAxNCBdID0gejtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRpbnZlcnQoKSB7XG5cblx0XHQvLyBiYXNlZCBvbiBodHRwOi8vd3d3LmV1Y2xpZGVhbnNwYWNlLmNvbS9tYXRocy9hbGdlYnJhL21hdHJpeC9mdW5jdGlvbnMvaW52ZXJzZS9mb3VyRC9pbmRleC5odG1cblx0XHRjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHMsXG5cblx0XHRcdG4xMSA9IHRlWyAwIF0sIG4yMSA9IHRlWyAxIF0sIG4zMSA9IHRlWyAyIF0sIG40MSA9IHRlWyAzIF0sXG5cdFx0XHRuMTIgPSB0ZVsgNCBdLCBuMjIgPSB0ZVsgNSBdLCBuMzIgPSB0ZVsgNiBdLCBuNDIgPSB0ZVsgNyBdLFxuXHRcdFx0bjEzID0gdGVbIDggXSwgbjIzID0gdGVbIDkgXSwgbjMzID0gdGVbIDEwIF0sIG40MyA9IHRlWyAxMSBdLFxuXHRcdFx0bjE0ID0gdGVbIDEyIF0sIG4yNCA9IHRlWyAxMyBdLCBuMzQgPSB0ZVsgMTQgXSwgbjQ0ID0gdGVbIDE1IF0sXG5cblx0XHRcdHQxMSA9IG4yMyAqIG4zNCAqIG40MiAtIG4yNCAqIG4zMyAqIG40MiArIG4yNCAqIG4zMiAqIG40MyAtIG4yMiAqIG4zNCAqIG40MyAtIG4yMyAqIG4zMiAqIG40NCArIG4yMiAqIG4zMyAqIG40NCxcblx0XHRcdHQxMiA9IG4xNCAqIG4zMyAqIG40MiAtIG4xMyAqIG4zNCAqIG40MiAtIG4xNCAqIG4zMiAqIG40MyArIG4xMiAqIG4zNCAqIG40MyArIG4xMyAqIG4zMiAqIG40NCAtIG4xMiAqIG4zMyAqIG40NCxcblx0XHRcdHQxMyA9IG4xMyAqIG4yNCAqIG40MiAtIG4xNCAqIG4yMyAqIG40MiArIG4xNCAqIG4yMiAqIG40MyAtIG4xMiAqIG4yNCAqIG40MyAtIG4xMyAqIG4yMiAqIG40NCArIG4xMiAqIG4yMyAqIG40NCxcblx0XHRcdHQxNCA9IG4xNCAqIG4yMyAqIG4zMiAtIG4xMyAqIG4yNCAqIG4zMiAtIG4xNCAqIG4yMiAqIG4zMyArIG4xMiAqIG4yNCAqIG4zMyArIG4xMyAqIG4yMiAqIG4zNCAtIG4xMiAqIG4yMyAqIG4zNDtcblxuXHRcdGNvbnN0IGRldCA9IG4xMSAqIHQxMSArIG4yMSAqIHQxMiArIG4zMSAqIHQxMyArIG40MSAqIHQxNDtcblxuXHRcdGlmICggZGV0ID09PSAwICkgcmV0dXJuIHRoaXMuc2V0KCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwICk7XG5cblx0XHRjb25zdCBkZXRJbnYgPSAxIC8gZGV0O1xuXG5cdFx0dGVbIDAgXSA9IHQxMSAqIGRldEludjtcblx0XHR0ZVsgMSBdID0gKCBuMjQgKiBuMzMgKiBuNDEgLSBuMjMgKiBuMzQgKiBuNDEgLSBuMjQgKiBuMzEgKiBuNDMgKyBuMjEgKiBuMzQgKiBuNDMgKyBuMjMgKiBuMzEgKiBuNDQgLSBuMjEgKiBuMzMgKiBuNDQgKSAqIGRldEludjtcblx0XHR0ZVsgMiBdID0gKCBuMjIgKiBuMzQgKiBuNDEgLSBuMjQgKiBuMzIgKiBuNDEgKyBuMjQgKiBuMzEgKiBuNDIgLSBuMjEgKiBuMzQgKiBuNDIgLSBuMjIgKiBuMzEgKiBuNDQgKyBuMjEgKiBuMzIgKiBuNDQgKSAqIGRldEludjtcblx0XHR0ZVsgMyBdID0gKCBuMjMgKiBuMzIgKiBuNDEgLSBuMjIgKiBuMzMgKiBuNDEgLSBuMjMgKiBuMzEgKiBuNDIgKyBuMjEgKiBuMzMgKiBuNDIgKyBuMjIgKiBuMzEgKiBuNDMgLSBuMjEgKiBuMzIgKiBuNDMgKSAqIGRldEludjtcblxuXHRcdHRlWyA0IF0gPSB0MTIgKiBkZXRJbnY7XG5cdFx0dGVbIDUgXSA9ICggbjEzICogbjM0ICogbjQxIC0gbjE0ICogbjMzICogbjQxICsgbjE0ICogbjMxICogbjQzIC0gbjExICogbjM0ICogbjQzIC0gbjEzICogbjMxICogbjQ0ICsgbjExICogbjMzICogbjQ0ICkgKiBkZXRJbnY7XG5cdFx0dGVbIDYgXSA9ICggbjE0ICogbjMyICogbjQxIC0gbjEyICogbjM0ICogbjQxIC0gbjE0ICogbjMxICogbjQyICsgbjExICogbjM0ICogbjQyICsgbjEyICogbjMxICogbjQ0IC0gbjExICogbjMyICogbjQ0ICkgKiBkZXRJbnY7XG5cdFx0dGVbIDcgXSA9ICggbjEyICogbjMzICogbjQxIC0gbjEzICogbjMyICogbjQxICsgbjEzICogbjMxICogbjQyIC0gbjExICogbjMzICogbjQyIC0gbjEyICogbjMxICogbjQzICsgbjExICogbjMyICogbjQzICkgKiBkZXRJbnY7XG5cblx0XHR0ZVsgOCBdID0gdDEzICogZGV0SW52O1xuXHRcdHRlWyA5IF0gPSAoIG4xNCAqIG4yMyAqIG40MSAtIG4xMyAqIG4yNCAqIG40MSAtIG4xNCAqIG4yMSAqIG40MyArIG4xMSAqIG4yNCAqIG40MyArIG4xMyAqIG4yMSAqIG40NCAtIG4xMSAqIG4yMyAqIG40NCApICogZGV0SW52O1xuXHRcdHRlWyAxMCBdID0gKCBuMTIgKiBuMjQgKiBuNDEgLSBuMTQgKiBuMjIgKiBuNDEgKyBuMTQgKiBuMjEgKiBuNDIgLSBuMTEgKiBuMjQgKiBuNDIgLSBuMTIgKiBuMjEgKiBuNDQgKyBuMTEgKiBuMjIgKiBuNDQgKSAqIGRldEludjtcblx0XHR0ZVsgMTEgXSA9ICggbjEzICogbjIyICogbjQxIC0gbjEyICogbjIzICogbjQxIC0gbjEzICogbjIxICogbjQyICsgbjExICogbjIzICogbjQyICsgbjEyICogbjIxICogbjQzIC0gbjExICogbjIyICogbjQzICkgKiBkZXRJbnY7XG5cblx0XHR0ZVsgMTIgXSA9IHQxNCAqIGRldEludjtcblx0XHR0ZVsgMTMgXSA9ICggbjEzICogbjI0ICogbjMxIC0gbjE0ICogbjIzICogbjMxICsgbjE0ICogbjIxICogbjMzIC0gbjExICogbjI0ICogbjMzIC0gbjEzICogbjIxICogbjM0ICsgbjExICogbjIzICogbjM0ICkgKiBkZXRJbnY7XG5cdFx0dGVbIDE0IF0gPSAoIG4xNCAqIG4yMiAqIG4zMSAtIG4xMiAqIG4yNCAqIG4zMSAtIG4xNCAqIG4yMSAqIG4zMiArIG4xMSAqIG4yNCAqIG4zMiArIG4xMiAqIG4yMSAqIG4zNCAtIG4xMSAqIG4yMiAqIG4zNCApICogZGV0SW52O1xuXHRcdHRlWyAxNSBdID0gKCBuMTIgKiBuMjMgKiBuMzEgLSBuMTMgKiBuMjIgKiBuMzEgKyBuMTMgKiBuMjEgKiBuMzIgLSBuMTEgKiBuMjMgKiBuMzIgLSBuMTIgKiBuMjEgKiBuMzMgKyBuMTEgKiBuMjIgKiBuMzMgKSAqIGRldEludjtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzY2FsZSggdiApIHtcblxuXHRcdGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcblx0XHRjb25zdCB4ID0gdi54LCB5ID0gdi55LCB6ID0gdi56O1xuXG5cdFx0dGVbIDAgXSAqPSB4OyB0ZVsgNCBdICo9IHk7IHRlWyA4IF0gKj0gejtcblx0XHR0ZVsgMSBdICo9IHg7IHRlWyA1IF0gKj0geTsgdGVbIDkgXSAqPSB6O1xuXHRcdHRlWyAyIF0gKj0geDsgdGVbIDYgXSAqPSB5OyB0ZVsgMTAgXSAqPSB6O1xuXHRcdHRlWyAzIF0gKj0geDsgdGVbIDcgXSAqPSB5OyB0ZVsgMTEgXSAqPSB6O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGdldE1heFNjYWxlT25BeGlzKCkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG5cdFx0Y29uc3Qgc2NhbGVYU3EgPSB0ZVsgMCBdICogdGVbIDAgXSArIHRlWyAxIF0gKiB0ZVsgMSBdICsgdGVbIDIgXSAqIHRlWyAyIF07XG5cdFx0Y29uc3Qgc2NhbGVZU3EgPSB0ZVsgNCBdICogdGVbIDQgXSArIHRlWyA1IF0gKiB0ZVsgNSBdICsgdGVbIDYgXSAqIHRlWyA2IF07XG5cdFx0Y29uc3Qgc2NhbGVaU3EgPSB0ZVsgOCBdICogdGVbIDggXSArIHRlWyA5IF0gKiB0ZVsgOSBdICsgdGVbIDEwIF0gKiB0ZVsgMTAgXTtcblxuXHRcdHJldHVybiBNYXRoLnNxcnQoIE1hdGgubWF4KCBzY2FsZVhTcSwgc2NhbGVZU3EsIHNjYWxlWlNxICkgKTtcblxuXHR9XG5cblx0bWFrZVRyYW5zbGF0aW9uKCB4LCB5LCB6ICkge1xuXG5cdFx0aWYgKCB4LmlzVmVjdG9yMyApIHtcblxuXHRcdFx0dGhpcy5zZXQoXG5cblx0XHRcdFx0MSwgMCwgMCwgeC54LFxuXHRcdFx0XHQwLCAxLCAwLCB4LnksXG5cdFx0XHRcdDAsIDAsIDEsIHgueixcblx0XHRcdFx0MCwgMCwgMCwgMVxuXG5cdFx0XHQpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dGhpcy5zZXQoXG5cblx0XHRcdFx0MSwgMCwgMCwgeCxcblx0XHRcdFx0MCwgMSwgMCwgeSxcblx0XHRcdFx0MCwgMCwgMSwgeixcblx0XHRcdFx0MCwgMCwgMCwgMVxuXG5cdFx0XHQpO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG1ha2VSb3RhdGlvblgoIHRoZXRhICkge1xuXG5cdFx0Y29uc3QgYyA9IE1hdGguY29zKCB0aGV0YSApLCBzID0gTWF0aC5zaW4oIHRoZXRhICk7XG5cblx0XHR0aGlzLnNldChcblxuXHRcdFx0MSwgMCwgMCwgMCxcblx0XHRcdDAsIGMsIC0gcywgMCxcblx0XHRcdDAsIHMsIGMsIDAsXG5cdFx0XHQwLCAwLCAwLCAxXG5cblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG1ha2VSb3RhdGlvblkoIHRoZXRhICkge1xuXG5cdFx0Y29uc3QgYyA9IE1hdGguY29zKCB0aGV0YSApLCBzID0gTWF0aC5zaW4oIHRoZXRhICk7XG5cblx0XHR0aGlzLnNldChcblxuXHRcdFx0IGMsIDAsIHMsIDAsXG5cdFx0XHQgMCwgMSwgMCwgMCxcblx0XHRcdC0gcywgMCwgYywgMCxcblx0XHRcdCAwLCAwLCAwLCAxXG5cblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG1ha2VSb3RhdGlvblooIHRoZXRhICkge1xuXG5cdFx0Y29uc3QgYyA9IE1hdGguY29zKCB0aGV0YSApLCBzID0gTWF0aC5zaW4oIHRoZXRhICk7XG5cblx0XHR0aGlzLnNldChcblxuXHRcdFx0YywgLSBzLCAwLCAwLFxuXHRcdFx0cywgYywgMCwgMCxcblx0XHRcdDAsIDAsIDEsIDAsXG5cdFx0XHQwLCAwLCAwLCAxXG5cblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG1ha2VSb3RhdGlvbkF4aXMoIGF4aXMsIGFuZ2xlICkge1xuXG5cdFx0Ly8gQmFzZWQgb24gaHR0cDovL3d3dy5nYW1lZGV2Lm5ldC9yZWZlcmVuY2UvYXJ0aWNsZXMvYXJ0aWNsZTExOTkuYXNwXG5cblx0XHRjb25zdCBjID0gTWF0aC5jb3MoIGFuZ2xlICk7XG5cdFx0Y29uc3QgcyA9IE1hdGguc2luKCBhbmdsZSApO1xuXHRcdGNvbnN0IHQgPSAxIC0gYztcblx0XHRjb25zdCB4ID0gYXhpcy54LCB5ID0gYXhpcy55LCB6ID0gYXhpcy56O1xuXHRcdGNvbnN0IHR4ID0gdCAqIHgsIHR5ID0gdCAqIHk7XG5cblx0XHR0aGlzLnNldChcblxuXHRcdFx0dHggKiB4ICsgYywgdHggKiB5IC0gcyAqIHosIHR4ICogeiArIHMgKiB5LCAwLFxuXHRcdFx0dHggKiB5ICsgcyAqIHosIHR5ICogeSArIGMsIHR5ICogeiAtIHMgKiB4LCAwLFxuXHRcdFx0dHggKiB6IC0gcyAqIHksIHR5ICogeiArIHMgKiB4LCB0ICogeiAqIHogKyBjLCAwLFxuXHRcdFx0MCwgMCwgMCwgMVxuXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRtYWtlU2NhbGUoIHgsIHksIHogKSB7XG5cblx0XHR0aGlzLnNldChcblxuXHRcdFx0eCwgMCwgMCwgMCxcblx0XHRcdDAsIHksIDAsIDAsXG5cdFx0XHQwLCAwLCB6LCAwLFxuXHRcdFx0MCwgMCwgMCwgMVxuXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRtYWtlU2hlYXIoIHh5LCB4eiwgeXgsIHl6LCB6eCwgenkgKSB7XG5cblx0XHR0aGlzLnNldChcblxuXHRcdFx0MSwgeXgsIHp4LCAwLFxuXHRcdFx0eHksIDEsIHp5LCAwLFxuXHRcdFx0eHosIHl6LCAxLCAwLFxuXHRcdFx0MCwgMCwgMCwgMVxuXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjb21wb3NlKCBwb3NpdGlvbiwgcXVhdGVybmlvbiwgc2NhbGUgKSB7XG5cblx0XHRjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHM7XG5cblx0XHRjb25zdCB4ID0gcXVhdGVybmlvbi5feCwgeSA9IHF1YXRlcm5pb24uX3ksIHogPSBxdWF0ZXJuaW9uLl96LCB3ID0gcXVhdGVybmlvbi5fdztcblx0XHRjb25zdCB4MiA9IHggKyB4LFx0eTIgPSB5ICsgeSwgejIgPSB6ICsgejtcblx0XHRjb25zdCB4eCA9IHggKiB4MiwgeHkgPSB4ICogeTIsIHh6ID0geCAqIHoyO1xuXHRcdGNvbnN0IHl5ID0geSAqIHkyLCB5eiA9IHkgKiB6MiwgenogPSB6ICogejI7XG5cdFx0Y29uc3Qgd3ggPSB3ICogeDIsIHd5ID0gdyAqIHkyLCB3eiA9IHcgKiB6MjtcblxuXHRcdGNvbnN0IHN4ID0gc2NhbGUueCwgc3kgPSBzY2FsZS55LCBzeiA9IHNjYWxlLno7XG5cblx0XHR0ZVsgMCBdID0gKCAxIC0gKCB5eSArIHp6ICkgKSAqIHN4O1xuXHRcdHRlWyAxIF0gPSAoIHh5ICsgd3ogKSAqIHN4O1xuXHRcdHRlWyAyIF0gPSAoIHh6IC0gd3kgKSAqIHN4O1xuXHRcdHRlWyAzIF0gPSAwO1xuXG5cdFx0dGVbIDQgXSA9ICggeHkgLSB3eiApICogc3k7XG5cdFx0dGVbIDUgXSA9ICggMSAtICggeHggKyB6eiApICkgKiBzeTtcblx0XHR0ZVsgNiBdID0gKCB5eiArIHd4ICkgKiBzeTtcblx0XHR0ZVsgNyBdID0gMDtcblxuXHRcdHRlWyA4IF0gPSAoIHh6ICsgd3kgKSAqIHN6O1xuXHRcdHRlWyA5IF0gPSAoIHl6IC0gd3ggKSAqIHN6O1xuXHRcdHRlWyAxMCBdID0gKCAxIC0gKCB4eCArIHl5ICkgKSAqIHN6O1xuXHRcdHRlWyAxMSBdID0gMDtcblxuXHRcdHRlWyAxMiBdID0gcG9zaXRpb24ueDtcblx0XHR0ZVsgMTMgXSA9IHBvc2l0aW9uLnk7XG5cdFx0dGVbIDE0IF0gPSBwb3NpdGlvbi56O1xuXHRcdHRlWyAxNSBdID0gMTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRkZWNvbXBvc2UoIHBvc2l0aW9uLCBxdWF0ZXJuaW9uLCBzY2FsZSApIHtcblxuXHRcdGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcblxuXHRcdGxldCBzeCA9IF92MS5zZXQoIHRlWyAwIF0sIHRlWyAxIF0sIHRlWyAyIF0gKS5sZW5ndGgoKTtcblx0XHRjb25zdCBzeSA9IF92MS5zZXQoIHRlWyA0IF0sIHRlWyA1IF0sIHRlWyA2IF0gKS5sZW5ndGgoKTtcblx0XHRjb25zdCBzeiA9IF92MS5zZXQoIHRlWyA4IF0sIHRlWyA5IF0sIHRlWyAxMCBdICkubGVuZ3RoKCk7XG5cblx0XHQvLyBpZiBkZXRlcm1pbmUgaXMgbmVnYXRpdmUsIHdlIG5lZWQgdG8gaW52ZXJ0IG9uZSBzY2FsZVxuXHRcdGNvbnN0IGRldCA9IHRoaXMuZGV0ZXJtaW5hbnQoKTtcblx0XHRpZiAoIGRldCA8IDAgKSBzeCA9IC0gc3g7XG5cblx0XHRwb3NpdGlvbi54ID0gdGVbIDEyIF07XG5cdFx0cG9zaXRpb24ueSA9IHRlWyAxMyBdO1xuXHRcdHBvc2l0aW9uLnogPSB0ZVsgMTQgXTtcblxuXHRcdC8vIHNjYWxlIHRoZSByb3RhdGlvbiBwYXJ0XG5cdFx0X20xLmNvcHkoIHRoaXMgKTtcblxuXHRcdGNvbnN0IGludlNYID0gMSAvIHN4O1xuXHRcdGNvbnN0IGludlNZID0gMSAvIHN5O1xuXHRcdGNvbnN0IGludlNaID0gMSAvIHN6O1xuXG5cdFx0X20xLmVsZW1lbnRzWyAwIF0gKj0gaW52U1g7XG5cdFx0X20xLmVsZW1lbnRzWyAxIF0gKj0gaW52U1g7XG5cdFx0X20xLmVsZW1lbnRzWyAyIF0gKj0gaW52U1g7XG5cblx0XHRfbTEuZWxlbWVudHNbIDQgXSAqPSBpbnZTWTtcblx0XHRfbTEuZWxlbWVudHNbIDUgXSAqPSBpbnZTWTtcblx0XHRfbTEuZWxlbWVudHNbIDYgXSAqPSBpbnZTWTtcblxuXHRcdF9tMS5lbGVtZW50c1sgOCBdICo9IGludlNaO1xuXHRcdF9tMS5lbGVtZW50c1sgOSBdICo9IGludlNaO1xuXHRcdF9tMS5lbGVtZW50c1sgMTAgXSAqPSBpbnZTWjtcblxuXHRcdHF1YXRlcm5pb24uc2V0RnJvbVJvdGF0aW9uTWF0cml4KCBfbTEgKTtcblxuXHRcdHNjYWxlLnggPSBzeDtcblx0XHRzY2FsZS55ID0gc3k7XG5cdFx0c2NhbGUueiA9IHN6O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG1ha2VQZXJzcGVjdGl2ZSggbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tLCBuZWFyLCBmYXIsIGNvb3JkaW5hdGVTeXN0ZW0gPSBXZWJHTENvb3JkaW5hdGVTeXN0ZW0gKSB7XG5cblx0XHRjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHM7XG5cdFx0Y29uc3QgeCA9IDIgKiBuZWFyIC8gKCByaWdodCAtIGxlZnQgKTtcblx0XHRjb25zdCB5ID0gMiAqIG5lYXIgLyAoIHRvcCAtIGJvdHRvbSApO1xuXG5cdFx0Y29uc3QgYSA9ICggcmlnaHQgKyBsZWZ0ICkgLyAoIHJpZ2h0IC0gbGVmdCApO1xuXHRcdGNvbnN0IGIgPSAoIHRvcCArIGJvdHRvbSApIC8gKCB0b3AgLSBib3R0b20gKTtcblxuXHRcdGxldCBjLCBkO1xuXG5cdFx0aWYgKCBjb29yZGluYXRlU3lzdGVtID09PSBXZWJHTENvb3JkaW5hdGVTeXN0ZW0gKSB7XG5cblx0XHRcdGMgPSAtICggZmFyICsgbmVhciApIC8gKCBmYXIgLSBuZWFyICk7XG5cdFx0XHRkID0gKCAtIDIgKiBmYXIgKiBuZWFyICkgLyAoIGZhciAtIG5lYXIgKTtcblxuXHRcdH0gZWxzZSBpZiAoIGNvb3JkaW5hdGVTeXN0ZW0gPT09IFdlYkdQVUNvb3JkaW5hdGVTeXN0ZW0gKSB7XG5cblx0XHRcdGMgPSAtIGZhciAvICggZmFyIC0gbmVhciApO1xuXHRcdFx0ZCA9ICggLSBmYXIgKiBuZWFyICkgLyAoIGZhciAtIG5lYXIgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHRocm93IG5ldyBFcnJvciggJ1RIUkVFLk1hdHJpeDQubWFrZVBlcnNwZWN0aXZlKCk6IEludmFsaWQgY29vcmRpbmF0ZSBzeXN0ZW06ICcgKyBjb29yZGluYXRlU3lzdGVtICk7XG5cblx0XHR9XG5cblx0XHR0ZVsgMCBdID0geDtcdHRlWyA0IF0gPSAwO1x0dGVbIDggXSA9IGE7IFx0dGVbIDEyIF0gPSAwO1xuXHRcdHRlWyAxIF0gPSAwO1x0dGVbIDUgXSA9IHk7XHR0ZVsgOSBdID0gYjsgXHR0ZVsgMTMgXSA9IDA7XG5cdFx0dGVbIDIgXSA9IDA7XHR0ZVsgNiBdID0gMDtcdHRlWyAxMCBdID0gYzsgXHR0ZVsgMTQgXSA9IGQ7XG5cdFx0dGVbIDMgXSA9IDA7XHR0ZVsgNyBdID0gMDtcdHRlWyAxMSBdID0gLSAxO1x0dGVbIDE1IF0gPSAwO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG1ha2VPcnRob2dyYXBoaWMoIGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSwgbmVhciwgZmFyLCBjb29yZGluYXRlU3lzdGVtID0gV2ViR0xDb29yZGluYXRlU3lzdGVtICkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXHRcdGNvbnN0IHcgPSAxLjAgLyAoIHJpZ2h0IC0gbGVmdCApO1xuXHRcdGNvbnN0IGggPSAxLjAgLyAoIHRvcCAtIGJvdHRvbSApO1xuXHRcdGNvbnN0IHAgPSAxLjAgLyAoIGZhciAtIG5lYXIgKTtcblxuXHRcdGNvbnN0IHggPSAoIHJpZ2h0ICsgbGVmdCApICogdztcblx0XHRjb25zdCB5ID0gKCB0b3AgKyBib3R0b20gKSAqIGg7XG5cblx0XHRsZXQgeiwgekludjtcblxuXHRcdGlmICggY29vcmRpbmF0ZVN5c3RlbSA9PT0gV2ViR0xDb29yZGluYXRlU3lzdGVtICkge1xuXG5cdFx0XHR6ID0gKCBmYXIgKyBuZWFyICkgKiBwO1xuXHRcdFx0ekludiA9IC0gMiAqIHA7XG5cblx0XHR9IGVsc2UgaWYgKCBjb29yZGluYXRlU3lzdGVtID09PSBXZWJHUFVDb29yZGluYXRlU3lzdGVtICkge1xuXG5cdFx0XHR6ID0gbmVhciAqIHA7XG5cdFx0XHR6SW52ID0gLSAxICogcDtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHRocm93IG5ldyBFcnJvciggJ1RIUkVFLk1hdHJpeDQubWFrZU9ydGhvZ3JhcGhpYygpOiBJbnZhbGlkIGNvb3JkaW5hdGUgc3lzdGVtOiAnICsgY29vcmRpbmF0ZVN5c3RlbSApO1xuXG5cdFx0fVxuXG5cdFx0dGVbIDAgXSA9IDIgKiB3O1x0dGVbIDQgXSA9IDA7XHRcdHRlWyA4IF0gPSAwOyBcdFx0dGVbIDEyIF0gPSAtIHg7XG5cdFx0dGVbIDEgXSA9IDA7IFx0XHR0ZVsgNSBdID0gMiAqIGg7XHR0ZVsgOSBdID0gMDsgXHRcdHRlWyAxMyBdID0gLSB5O1xuXHRcdHRlWyAyIF0gPSAwOyBcdFx0dGVbIDYgXSA9IDA7XHRcdHRlWyAxMCBdID0gekludjtcdHRlWyAxNCBdID0gLSB6O1xuXHRcdHRlWyAzIF0gPSAwOyBcdFx0dGVbIDcgXSA9IDA7XHRcdHRlWyAxMSBdID0gMDtcdFx0dGVbIDE1IF0gPSAxO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGVxdWFscyggbWF0cml4ICkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXHRcdGNvbnN0IG1lID0gbWF0cml4LmVsZW1lbnRzO1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgMTY7IGkgKysgKSB7XG5cblx0XHRcdGlmICggdGVbIGkgXSAhPT0gbWVbIGkgXSApIHJldHVybiBmYWxzZTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH1cblxuXHRmcm9tQXJyYXkoIGFycmF5LCBvZmZzZXQgPSAwICkge1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgMTY7IGkgKysgKSB7XG5cblx0XHRcdHRoaXMuZWxlbWVudHNbIGkgXSA9IGFycmF5WyBpICsgb2Zmc2V0IF07XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0dG9BcnJheSggYXJyYXkgPSBbXSwgb2Zmc2V0ID0gMCApIHtcblxuXHRcdGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcblxuXHRcdGFycmF5WyBvZmZzZXQgXSA9IHRlWyAwIF07XG5cdFx0YXJyYXlbIG9mZnNldCArIDEgXSA9IHRlWyAxIF07XG5cdFx0YXJyYXlbIG9mZnNldCArIDIgXSA9IHRlWyAyIF07XG5cdFx0YXJyYXlbIG9mZnNldCArIDMgXSA9IHRlWyAzIF07XG5cblx0XHRhcnJheVsgb2Zmc2V0ICsgNCBdID0gdGVbIDQgXTtcblx0XHRhcnJheVsgb2Zmc2V0ICsgNSBdID0gdGVbIDUgXTtcblx0XHRhcnJheVsgb2Zmc2V0ICsgNiBdID0gdGVbIDYgXTtcblx0XHRhcnJheVsgb2Zmc2V0ICsgNyBdID0gdGVbIDcgXTtcblxuXHRcdGFycmF5WyBvZmZzZXQgKyA4IF0gPSB0ZVsgOCBdO1xuXHRcdGFycmF5WyBvZmZzZXQgKyA5IF0gPSB0ZVsgOSBdO1xuXHRcdGFycmF5WyBvZmZzZXQgKyAxMCBdID0gdGVbIDEwIF07XG5cdFx0YXJyYXlbIG9mZnNldCArIDExIF0gPSB0ZVsgMTEgXTtcblxuXHRcdGFycmF5WyBvZmZzZXQgKyAxMiBdID0gdGVbIDEyIF07XG5cdFx0YXJyYXlbIG9mZnNldCArIDEzIF0gPSB0ZVsgMTMgXTtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMTQgXSA9IHRlWyAxNCBdO1xuXHRcdGFycmF5WyBvZmZzZXQgKyAxNSBdID0gdGVbIDE1IF07XG5cblx0XHRyZXR1cm4gYXJyYXk7XG5cblx0fVxuXG59XG5cbmNvbnN0IF92MSA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoKTtcbmNvbnN0IF9tMSA9IC8qQF9fUFVSRV9fKi8gbmV3IE1hdHJpeDQoKTtcbmNvbnN0IF96ZXJvID0gLypAX19QVVJFX18qLyBuZXcgVmVjdG9yMyggMCwgMCwgMCApO1xuY29uc3QgX29uZSA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoIDEsIDEsIDEgKTtcbmNvbnN0IF94ID0gLypAX19QVVJFX18qLyBuZXcgVmVjdG9yMygpO1xuY29uc3QgX3kgPSAvKkBfX1BVUkVfXyovIG5ldyBWZWN0b3IzKCk7XG5jb25zdCBfeiA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoKTtcblxuZXhwb3J0IHsgTWF0cml4NCB9O1xuIiwiaW1wb3J0IHsgUXVhdGVybmlvbiB9IGZyb20gJy4vUXVhdGVybmlvbi5qcyc7XG5pbXBvcnQgeyBNYXRyaXg0IH0gZnJvbSAnLi9NYXRyaXg0LmpzJztcbmltcG9ydCB7IGNsYW1wIH0gZnJvbSAnLi9NYXRoVXRpbHMuanMnO1xuXG5jb25zdCBfbWF0cml4ID0gLypAX19QVVJFX18qLyBuZXcgTWF0cml4NCgpO1xuY29uc3QgX3F1YXRlcm5pb24gPSAvKkBfX1BVUkVfXyovIG5ldyBRdWF0ZXJuaW9uKCk7XG5cbmNsYXNzIEV1bGVyIHtcblxuXHRjb25zdHJ1Y3RvciggeCA9IDAsIHkgPSAwLCB6ID0gMCwgb3JkZXIgPSBFdWxlci5ERUZBVUxUX09SREVSICkge1xuXG5cdFx0dGhpcy5pc0V1bGVyID0gdHJ1ZTtcblxuXHRcdHRoaXMuX3ggPSB4O1xuXHRcdHRoaXMuX3kgPSB5O1xuXHRcdHRoaXMuX3ogPSB6O1xuXHRcdHRoaXMuX29yZGVyID0gb3JkZXI7XG5cblx0fVxuXG5cdGdldCB4KCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuX3g7XG5cblx0fVxuXG5cdHNldCB4KCB2YWx1ZSApIHtcblxuXHRcdHRoaXMuX3ggPSB2YWx1ZTtcblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fVxuXG5cdGdldCB5KCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuX3k7XG5cblx0fVxuXG5cdHNldCB5KCB2YWx1ZSApIHtcblxuXHRcdHRoaXMuX3kgPSB2YWx1ZTtcblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fVxuXG5cdGdldCB6KCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuX3o7XG5cblx0fVxuXG5cdHNldCB6KCB2YWx1ZSApIHtcblxuXHRcdHRoaXMuX3ogPSB2YWx1ZTtcblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fVxuXG5cdGdldCBvcmRlcigpIHtcblxuXHRcdHJldHVybiB0aGlzLl9vcmRlcjtcblxuXHR9XG5cblx0c2V0IG9yZGVyKCB2YWx1ZSApIHtcblxuXHRcdHRoaXMuX29yZGVyID0gdmFsdWU7XG5cdFx0dGhpcy5fb25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdH1cblxuXHRzZXQoIHgsIHksIHosIG9yZGVyID0gdGhpcy5fb3JkZXIgKSB7XG5cblx0XHR0aGlzLl94ID0geDtcblx0XHR0aGlzLl95ID0geTtcblx0XHR0aGlzLl96ID0gejtcblx0XHR0aGlzLl9vcmRlciA9IG9yZGVyO1xuXG5cdFx0dGhpcy5fb25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNsb25lKCkge1xuXG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCB0aGlzLl94LCB0aGlzLl95LCB0aGlzLl96LCB0aGlzLl9vcmRlciApO1xuXG5cdH1cblxuXHRjb3B5KCBldWxlciApIHtcblxuXHRcdHRoaXMuX3ggPSBldWxlci5feDtcblx0XHR0aGlzLl95ID0gZXVsZXIuX3k7XG5cdFx0dGhpcy5feiA9IGV1bGVyLl96O1xuXHRcdHRoaXMuX29yZGVyID0gZXVsZXIuX29yZGVyO1xuXG5cdFx0dGhpcy5fb25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21Sb3RhdGlvbk1hdHJpeCggbSwgb3JkZXIgPSB0aGlzLl9vcmRlciwgdXBkYXRlID0gdHJ1ZSApIHtcblxuXHRcdC8vIGFzc3VtZXMgdGhlIHVwcGVyIDN4MyBvZiBtIGlzIGEgcHVyZSByb3RhdGlvbiBtYXRyaXggKGkuZSwgdW5zY2FsZWQpXG5cblx0XHRjb25zdCB0ZSA9IG0uZWxlbWVudHM7XG5cdFx0Y29uc3QgbTExID0gdGVbIDAgXSwgbTEyID0gdGVbIDQgXSwgbTEzID0gdGVbIDggXTtcblx0XHRjb25zdCBtMjEgPSB0ZVsgMSBdLCBtMjIgPSB0ZVsgNSBdLCBtMjMgPSB0ZVsgOSBdO1xuXHRcdGNvbnN0IG0zMSA9IHRlWyAyIF0sIG0zMiA9IHRlWyA2IF0sIG0zMyA9IHRlWyAxMCBdO1xuXG5cdFx0c3dpdGNoICggb3JkZXIgKSB7XG5cblx0XHRcdGNhc2UgJ1hZWic6XG5cblx0XHRcdFx0dGhpcy5feSA9IE1hdGguYXNpbiggY2xhbXAoIG0xMywgLSAxLCAxICkgKTtcblxuXHRcdFx0XHRpZiAoIE1hdGguYWJzKCBtMTMgKSA8IDAuOTk5OTk5OSApIHtcblxuXHRcdFx0XHRcdHRoaXMuX3ggPSBNYXRoLmF0YW4yKCAtIG0yMywgbTMzICk7XG5cdFx0XHRcdFx0dGhpcy5feiA9IE1hdGguYXRhbjIoIC0gbTEyLCBtMTEgKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0dGhpcy5feCA9IE1hdGguYXRhbjIoIG0zMiwgbTIyICk7XG5cdFx0XHRcdFx0dGhpcy5feiA9IDA7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdZWFonOlxuXG5cdFx0XHRcdHRoaXMuX3ggPSBNYXRoLmFzaW4oIC0gY2xhbXAoIG0yMywgLSAxLCAxICkgKTtcblxuXHRcdFx0XHRpZiAoIE1hdGguYWJzKCBtMjMgKSA8IDAuOTk5OTk5OSApIHtcblxuXHRcdFx0XHRcdHRoaXMuX3kgPSBNYXRoLmF0YW4yKCBtMTMsIG0zMyApO1xuXHRcdFx0XHRcdHRoaXMuX3ogPSBNYXRoLmF0YW4yKCBtMjEsIG0yMiApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHR0aGlzLl95ID0gTWF0aC5hdGFuMiggLSBtMzEsIG0xMSApO1xuXHRcdFx0XHRcdHRoaXMuX3ogPSAwO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnWlhZJzpcblxuXHRcdFx0XHR0aGlzLl94ID0gTWF0aC5hc2luKCBjbGFtcCggbTMyLCAtIDEsIDEgKSApO1xuXG5cdFx0XHRcdGlmICggTWF0aC5hYnMoIG0zMiApIDwgMC45OTk5OTk5ICkge1xuXG5cdFx0XHRcdFx0dGhpcy5feSA9IE1hdGguYXRhbjIoIC0gbTMxLCBtMzMgKTtcblx0XHRcdFx0XHR0aGlzLl96ID0gTWF0aC5hdGFuMiggLSBtMTIsIG0yMiApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHR0aGlzLl95ID0gMDtcblx0XHRcdFx0XHR0aGlzLl96ID0gTWF0aC5hdGFuMiggbTIxLCBtMTEgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ1pZWCc6XG5cblx0XHRcdFx0dGhpcy5feSA9IE1hdGguYXNpbiggLSBjbGFtcCggbTMxLCAtIDEsIDEgKSApO1xuXG5cdFx0XHRcdGlmICggTWF0aC5hYnMoIG0zMSApIDwgMC45OTk5OTk5ICkge1xuXG5cdFx0XHRcdFx0dGhpcy5feCA9IE1hdGguYXRhbjIoIG0zMiwgbTMzICk7XG5cdFx0XHRcdFx0dGhpcy5feiA9IE1hdGguYXRhbjIoIG0yMSwgbTExICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdHRoaXMuX3ggPSAwO1xuXHRcdFx0XHRcdHRoaXMuX3ogPSBNYXRoLmF0YW4yKCAtIG0xMiwgbTIyICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdZWlgnOlxuXG5cdFx0XHRcdHRoaXMuX3ogPSBNYXRoLmFzaW4oIGNsYW1wKCBtMjEsIC0gMSwgMSApICk7XG5cblx0XHRcdFx0aWYgKCBNYXRoLmFicyggbTIxICkgPCAwLjk5OTk5OTkgKSB7XG5cblx0XHRcdFx0XHR0aGlzLl94ID0gTWF0aC5hdGFuMiggLSBtMjMsIG0yMiApO1xuXHRcdFx0XHRcdHRoaXMuX3kgPSBNYXRoLmF0YW4yKCAtIG0zMSwgbTExICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdHRoaXMuX3ggPSAwO1xuXHRcdFx0XHRcdHRoaXMuX3kgPSBNYXRoLmF0YW4yKCBtMTMsIG0zMyApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnWFpZJzpcblxuXHRcdFx0XHR0aGlzLl96ID0gTWF0aC5hc2luKCAtIGNsYW1wKCBtMTIsIC0gMSwgMSApICk7XG5cblx0XHRcdFx0aWYgKCBNYXRoLmFicyggbTEyICkgPCAwLjk5OTk5OTkgKSB7XG5cblx0XHRcdFx0XHR0aGlzLl94ID0gTWF0aC5hdGFuMiggbTMyLCBtMjIgKTtcblx0XHRcdFx0XHR0aGlzLl95ID0gTWF0aC5hdGFuMiggbTEzLCBtMTEgKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0dGhpcy5feCA9IE1hdGguYXRhbjIoIC0gbTIzLCBtMzMgKTtcblx0XHRcdFx0XHR0aGlzLl95ID0gMDtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cblx0XHRcdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuRXVsZXI6IC5zZXRGcm9tUm90YXRpb25NYXRyaXgoKSBlbmNvdW50ZXJlZCBhbiB1bmtub3duIG9yZGVyOiAnICsgb3JkZXIgKTtcblxuXHRcdH1cblxuXHRcdHRoaXMuX29yZGVyID0gb3JkZXI7XG5cblx0XHRpZiAoIHVwZGF0ZSA9PT0gdHJ1ZSApIHRoaXMuX29uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRGcm9tUXVhdGVybmlvbiggcSwgb3JkZXIsIHVwZGF0ZSApIHtcblxuXHRcdF9tYXRyaXgubWFrZVJvdGF0aW9uRnJvbVF1YXRlcm5pb24oIHEgKTtcblxuXHRcdHJldHVybiB0aGlzLnNldEZyb21Sb3RhdGlvbk1hdHJpeCggX21hdHJpeCwgb3JkZXIsIHVwZGF0ZSApO1xuXG5cdH1cblxuXHRzZXRGcm9tVmVjdG9yMyggdiwgb3JkZXIgPSB0aGlzLl9vcmRlciApIHtcblxuXHRcdHJldHVybiB0aGlzLnNldCggdi54LCB2LnksIHYueiwgb3JkZXIgKTtcblxuXHR9XG5cblx0cmVvcmRlciggbmV3T3JkZXIgKSB7XG5cblx0XHQvLyBXQVJOSU5HOiB0aGlzIGRpc2NhcmRzIHJldm9sdXRpb24gaW5mb3JtYXRpb24gLWJob3VzdG9uXG5cblx0XHRfcXVhdGVybmlvbi5zZXRGcm9tRXVsZXIoIHRoaXMgKTtcblxuXHRcdHJldHVybiB0aGlzLnNldEZyb21RdWF0ZXJuaW9uKCBfcXVhdGVybmlvbiwgbmV3T3JkZXIgKTtcblxuXHR9XG5cblx0ZXF1YWxzKCBldWxlciApIHtcblxuXHRcdHJldHVybiAoIGV1bGVyLl94ID09PSB0aGlzLl94ICkgJiYgKCBldWxlci5feSA9PT0gdGhpcy5feSApICYmICggZXVsZXIuX3ogPT09IHRoaXMuX3ogKSAmJiAoIGV1bGVyLl9vcmRlciA9PT0gdGhpcy5fb3JkZXIgKTtcblxuXHR9XG5cblx0ZnJvbUFycmF5KCBhcnJheSApIHtcblxuXHRcdHRoaXMuX3ggPSBhcnJheVsgMCBdO1xuXHRcdHRoaXMuX3kgPSBhcnJheVsgMSBdO1xuXHRcdHRoaXMuX3ogPSBhcnJheVsgMiBdO1xuXHRcdGlmICggYXJyYXlbIDMgXSAhPT0gdW5kZWZpbmVkICkgdGhpcy5fb3JkZXIgPSBhcnJheVsgMyBdO1xuXG5cdFx0dGhpcy5fb25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHRvQXJyYXkoIGFycmF5ID0gW10sIG9mZnNldCA9IDAgKSB7XG5cblx0XHRhcnJheVsgb2Zmc2V0IF0gPSB0aGlzLl94O1xuXHRcdGFycmF5WyBvZmZzZXQgKyAxIF0gPSB0aGlzLl95O1xuXHRcdGFycmF5WyBvZmZzZXQgKyAyIF0gPSB0aGlzLl96O1xuXHRcdGFycmF5WyBvZmZzZXQgKyAzIF0gPSB0aGlzLl9vcmRlcjtcblxuXHRcdHJldHVybiBhcnJheTtcblxuXHR9XG5cblx0X29uQ2hhbmdlKCBjYWxsYmFjayApIHtcblxuXHRcdHRoaXMuX29uQ2hhbmdlQ2FsbGJhY2sgPSBjYWxsYmFjaztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRfb25DaGFuZ2VDYWxsYmFjaygpIHt9XG5cblx0KlsgU3ltYm9sLml0ZXJhdG9yIF0oKSB7XG5cblx0XHR5aWVsZCB0aGlzLl94O1xuXHRcdHlpZWxkIHRoaXMuX3k7XG5cdFx0eWllbGQgdGhpcy5fejtcblx0XHR5aWVsZCB0aGlzLl9vcmRlcjtcblxuXHR9XG5cbn1cblxuRXVsZXIuREVGQVVMVF9PUkRFUiA9ICdYWVonO1xuXG5leHBvcnQgeyBFdWxlciB9O1xuIiwiY2xhc3MgTGF5ZXJzIHtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblxuXHRcdHRoaXMubWFzayA9IDEgfCAwO1xuXG5cdH1cblxuXHRzZXQoIGNoYW5uZWwgKSB7XG5cblx0XHR0aGlzLm1hc2sgPSAoIDEgPDwgY2hhbm5lbCB8IDAgKSA+Pj4gMDtcblxuXHR9XG5cblx0ZW5hYmxlKCBjaGFubmVsICkge1xuXG5cdFx0dGhpcy5tYXNrIHw9IDEgPDwgY2hhbm5lbCB8IDA7XG5cblx0fVxuXG5cdGVuYWJsZUFsbCgpIHtcblxuXHRcdHRoaXMubWFzayA9IDB4ZmZmZmZmZmYgfCAwO1xuXG5cdH1cblxuXHR0b2dnbGUoIGNoYW5uZWwgKSB7XG5cblx0XHR0aGlzLm1hc2sgXj0gMSA8PCBjaGFubmVsIHwgMDtcblxuXHR9XG5cblx0ZGlzYWJsZSggY2hhbm5lbCApIHtcblxuXHRcdHRoaXMubWFzayAmPSB+ICggMSA8PCBjaGFubmVsIHwgMCApO1xuXG5cdH1cblxuXHRkaXNhYmxlQWxsKCkge1xuXG5cdFx0dGhpcy5tYXNrID0gMDtcblxuXHR9XG5cblx0dGVzdCggbGF5ZXJzICkge1xuXG5cdFx0cmV0dXJuICggdGhpcy5tYXNrICYgbGF5ZXJzLm1hc2sgKSAhPT0gMDtcblxuXHR9XG5cblx0aXNFbmFibGVkKCBjaGFubmVsICkge1xuXG5cdFx0cmV0dXJuICggdGhpcy5tYXNrICYgKCAxIDw8IGNoYW5uZWwgfCAwICkgKSAhPT0gMDtcblxuXHR9XG5cbn1cblxuXG5leHBvcnQgeyBMYXllcnMgfTtcbiIsImNsYXNzIE1hdHJpeDMge1xuXG5cdGNvbnN0cnVjdG9yKCBuMTEsIG4xMiwgbjEzLCBuMjEsIG4yMiwgbjIzLCBuMzEsIG4zMiwgbjMzICkge1xuXG5cdFx0TWF0cml4My5wcm90b3R5cGUuaXNNYXRyaXgzID0gdHJ1ZTtcblxuXHRcdHRoaXMuZWxlbWVudHMgPSBbXG5cblx0XHRcdDEsIDAsIDAsXG5cdFx0XHQwLCAxLCAwLFxuXHRcdFx0MCwgMCwgMVxuXG5cdFx0XTtcblxuXHRcdGlmICggbjExICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHRoaXMuc2V0KCBuMTEsIG4xMiwgbjEzLCBuMjEsIG4yMiwgbjIzLCBuMzEsIG4zMiwgbjMzICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdHNldCggbjExLCBuMTIsIG4xMywgbjIxLCBuMjIsIG4yMywgbjMxLCBuMzIsIG4zMyApIHtcblxuXHRcdGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcblxuXHRcdHRlWyAwIF0gPSBuMTE7IHRlWyAxIF0gPSBuMjE7IHRlWyAyIF0gPSBuMzE7XG5cdFx0dGVbIDMgXSA9IG4xMjsgdGVbIDQgXSA9IG4yMjsgdGVbIDUgXSA9IG4zMjtcblx0XHR0ZVsgNiBdID0gbjEzOyB0ZVsgNyBdID0gbjIzOyB0ZVsgOCBdID0gbjMzO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGlkZW50aXR5KCkge1xuXG5cdFx0dGhpcy5zZXQoXG5cblx0XHRcdDEsIDAsIDAsXG5cdFx0XHQwLCAxLCAwLFxuXHRcdFx0MCwgMCwgMVxuXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjb3B5KCBtICkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXHRcdGNvbnN0IG1lID0gbS5lbGVtZW50cztcblxuXHRcdHRlWyAwIF0gPSBtZVsgMCBdOyB0ZVsgMSBdID0gbWVbIDEgXTsgdGVbIDIgXSA9IG1lWyAyIF07XG5cdFx0dGVbIDMgXSA9IG1lWyAzIF07IHRlWyA0IF0gPSBtZVsgNCBdOyB0ZVsgNSBdID0gbWVbIDUgXTtcblx0XHR0ZVsgNiBdID0gbWVbIDYgXTsgdGVbIDcgXSA9IG1lWyA3IF07IHRlWyA4IF0gPSBtZVsgOCBdO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGV4dHJhY3RCYXNpcyggeEF4aXMsIHlBeGlzLCB6QXhpcyApIHtcblxuXHRcdHhBeGlzLnNldEZyb21NYXRyaXgzQ29sdW1uKCB0aGlzLCAwICk7XG5cdFx0eUF4aXMuc2V0RnJvbU1hdHJpeDNDb2x1bW4oIHRoaXMsIDEgKTtcblx0XHR6QXhpcy5zZXRGcm9tTWF0cml4M0NvbHVtbiggdGhpcywgMiApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21NYXRyaXg0KCBtICkge1xuXG5cdFx0Y29uc3QgbWUgPSBtLmVsZW1lbnRzO1xuXG5cdFx0dGhpcy5zZXQoXG5cblx0XHRcdG1lWyAwIF0sIG1lWyA0IF0sIG1lWyA4IF0sXG5cdFx0XHRtZVsgMSBdLCBtZVsgNSBdLCBtZVsgOSBdLFxuXHRcdFx0bWVbIDIgXSwgbWVbIDYgXSwgbWVbIDEwIF1cblxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bXVsdGlwbHkoIG0gKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseU1hdHJpY2VzKCB0aGlzLCBtICk7XG5cblx0fVxuXG5cdHByZW11bHRpcGx5KCBtICkge1xuXG5cdFx0cmV0dXJuIHRoaXMubXVsdGlwbHlNYXRyaWNlcyggbSwgdGhpcyApO1xuXG5cdH1cblxuXHRtdWx0aXBseU1hdHJpY2VzKCBhLCBiICkge1xuXG5cdFx0Y29uc3QgYWUgPSBhLmVsZW1lbnRzO1xuXHRcdGNvbnN0IGJlID0gYi5lbGVtZW50cztcblx0XHRjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHM7XG5cblx0XHRjb25zdCBhMTEgPSBhZVsgMCBdLCBhMTIgPSBhZVsgMyBdLCBhMTMgPSBhZVsgNiBdO1xuXHRcdGNvbnN0IGEyMSA9IGFlWyAxIF0sIGEyMiA9IGFlWyA0IF0sIGEyMyA9IGFlWyA3IF07XG5cdFx0Y29uc3QgYTMxID0gYWVbIDIgXSwgYTMyID0gYWVbIDUgXSwgYTMzID0gYWVbIDggXTtcblxuXHRcdGNvbnN0IGIxMSA9IGJlWyAwIF0sIGIxMiA9IGJlWyAzIF0sIGIxMyA9IGJlWyA2IF07XG5cdFx0Y29uc3QgYjIxID0gYmVbIDEgXSwgYjIyID0gYmVbIDQgXSwgYjIzID0gYmVbIDcgXTtcblx0XHRjb25zdCBiMzEgPSBiZVsgMiBdLCBiMzIgPSBiZVsgNSBdLCBiMzMgPSBiZVsgOCBdO1xuXG5cdFx0dGVbIDAgXSA9IGExMSAqIGIxMSArIGExMiAqIGIyMSArIGExMyAqIGIzMTtcblx0XHR0ZVsgMyBdID0gYTExICogYjEyICsgYTEyICogYjIyICsgYTEzICogYjMyO1xuXHRcdHRlWyA2IF0gPSBhMTEgKiBiMTMgKyBhMTIgKiBiMjMgKyBhMTMgKiBiMzM7XG5cblx0XHR0ZVsgMSBdID0gYTIxICogYjExICsgYTIyICogYjIxICsgYTIzICogYjMxO1xuXHRcdHRlWyA0IF0gPSBhMjEgKiBiMTIgKyBhMjIgKiBiMjIgKyBhMjMgKiBiMzI7XG5cdFx0dGVbIDcgXSA9IGEyMSAqIGIxMyArIGEyMiAqIGIyMyArIGEyMyAqIGIzMztcblxuXHRcdHRlWyAyIF0gPSBhMzEgKiBiMTEgKyBhMzIgKiBiMjEgKyBhMzMgKiBiMzE7XG5cdFx0dGVbIDUgXSA9IGEzMSAqIGIxMiArIGEzMiAqIGIyMiArIGEzMyAqIGIzMjtcblx0XHR0ZVsgOCBdID0gYTMxICogYjEzICsgYTMyICogYjIzICsgYTMzICogYjMzO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG11bHRpcGx5U2NhbGFyKCBzICkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG5cdFx0dGVbIDAgXSAqPSBzOyB0ZVsgMyBdICo9IHM7IHRlWyA2IF0gKj0gcztcblx0XHR0ZVsgMSBdICo9IHM7IHRlWyA0IF0gKj0gczsgdGVbIDcgXSAqPSBzO1xuXHRcdHRlWyAyIF0gKj0gczsgdGVbIDUgXSAqPSBzOyB0ZVsgOCBdICo9IHM7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0ZGV0ZXJtaW5hbnQoKSB7XG5cblx0XHRjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHM7XG5cblx0XHRjb25zdCBhID0gdGVbIDAgXSwgYiA9IHRlWyAxIF0sIGMgPSB0ZVsgMiBdLFxuXHRcdFx0ZCA9IHRlWyAzIF0sIGUgPSB0ZVsgNCBdLCBmID0gdGVbIDUgXSxcblx0XHRcdGcgPSB0ZVsgNiBdLCBoID0gdGVbIDcgXSwgaSA9IHRlWyA4IF07XG5cblx0XHRyZXR1cm4gYSAqIGUgKiBpIC0gYSAqIGYgKiBoIC0gYiAqIGQgKiBpICsgYiAqIGYgKiBnICsgYyAqIGQgKiBoIC0gYyAqIGUgKiBnO1xuXG5cdH1cblxuXHRpbnZlcnQoKSB7XG5cblx0XHRjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHMsXG5cblx0XHRcdG4xMSA9IHRlWyAwIF0sIG4yMSA9IHRlWyAxIF0sIG4zMSA9IHRlWyAyIF0sXG5cdFx0XHRuMTIgPSB0ZVsgMyBdLCBuMjIgPSB0ZVsgNCBdLCBuMzIgPSB0ZVsgNSBdLFxuXHRcdFx0bjEzID0gdGVbIDYgXSwgbjIzID0gdGVbIDcgXSwgbjMzID0gdGVbIDggXSxcblxuXHRcdFx0dDExID0gbjMzICogbjIyIC0gbjMyICogbjIzLFxuXHRcdFx0dDEyID0gbjMyICogbjEzIC0gbjMzICogbjEyLFxuXHRcdFx0dDEzID0gbjIzICogbjEyIC0gbjIyICogbjEzLFxuXG5cdFx0XHRkZXQgPSBuMTEgKiB0MTEgKyBuMjEgKiB0MTIgKyBuMzEgKiB0MTM7XG5cblx0XHRpZiAoIGRldCA9PT0gMCApIHJldHVybiB0aGlzLnNldCggMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCApO1xuXG5cdFx0Y29uc3QgZGV0SW52ID0gMSAvIGRldDtcblxuXHRcdHRlWyAwIF0gPSB0MTEgKiBkZXRJbnY7XG5cdFx0dGVbIDEgXSA9ICggbjMxICogbjIzIC0gbjMzICogbjIxICkgKiBkZXRJbnY7XG5cdFx0dGVbIDIgXSA9ICggbjMyICogbjIxIC0gbjMxICogbjIyICkgKiBkZXRJbnY7XG5cblx0XHR0ZVsgMyBdID0gdDEyICogZGV0SW52O1xuXHRcdHRlWyA0IF0gPSAoIG4zMyAqIG4xMSAtIG4zMSAqIG4xMyApICogZGV0SW52O1xuXHRcdHRlWyA1IF0gPSAoIG4zMSAqIG4xMiAtIG4zMiAqIG4xMSApICogZGV0SW52O1xuXG5cdFx0dGVbIDYgXSA9IHQxMyAqIGRldEludjtcblx0XHR0ZVsgNyBdID0gKCBuMjEgKiBuMTMgLSBuMjMgKiBuMTEgKSAqIGRldEludjtcblx0XHR0ZVsgOCBdID0gKCBuMjIgKiBuMTEgLSBuMjEgKiBuMTIgKSAqIGRldEludjtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR0cmFuc3Bvc2UoKSB7XG5cblx0XHRsZXQgdG1wO1xuXHRcdGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuXG5cdFx0dG1wID0gbVsgMSBdOyBtWyAxIF0gPSBtWyAzIF07IG1bIDMgXSA9IHRtcDtcblx0XHR0bXAgPSBtWyAyIF07IG1bIDIgXSA9IG1bIDYgXTsgbVsgNiBdID0gdG1wO1xuXHRcdHRtcCA9IG1bIDUgXTsgbVsgNSBdID0gbVsgNyBdOyBtWyA3IF0gPSB0bXA7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Z2V0Tm9ybWFsTWF0cml4KCBtYXRyaXg0ICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuc2V0RnJvbU1hdHJpeDQoIG1hdHJpeDQgKS5pbnZlcnQoKS50cmFuc3Bvc2UoKTtcblxuXHR9XG5cblx0dHJhbnNwb3NlSW50b0FycmF5KCByICkge1xuXG5cdFx0Y29uc3QgbSA9IHRoaXMuZWxlbWVudHM7XG5cblx0XHRyWyAwIF0gPSBtWyAwIF07XG5cdFx0clsgMSBdID0gbVsgMyBdO1xuXHRcdHJbIDIgXSA9IG1bIDYgXTtcblx0XHRyWyAzIF0gPSBtWyAxIF07XG5cdFx0clsgNCBdID0gbVsgNCBdO1xuXHRcdHJbIDUgXSA9IG1bIDcgXTtcblx0XHRyWyA2IF0gPSBtWyAyIF07XG5cdFx0clsgNyBdID0gbVsgNSBdO1xuXHRcdHJbIDggXSA9IG1bIDggXTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRVdlRyYW5zZm9ybSggdHgsIHR5LCBzeCwgc3ksIHJvdGF0aW9uLCBjeCwgY3kgKSB7XG5cblx0XHRjb25zdCBjID0gTWF0aC5jb3MoIHJvdGF0aW9uICk7XG5cdFx0Y29uc3QgcyA9IE1hdGguc2luKCByb3RhdGlvbiApO1xuXG5cdFx0dGhpcy5zZXQoXG5cdFx0XHRzeCAqIGMsIHN4ICogcywgLSBzeCAqICggYyAqIGN4ICsgcyAqIGN5ICkgKyBjeCArIHR4LFxuXHRcdFx0LSBzeSAqIHMsIHN5ICogYywgLSBzeSAqICggLSBzICogY3ggKyBjICogY3kgKSArIGN5ICsgdHksXG5cdFx0XHQwLCAwLCAxXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQvL1xuXG5cdHNjYWxlKCBzeCwgc3kgKSB7XG5cblx0XHR0aGlzLnByZW11bHRpcGx5KCBfbTMubWFrZVNjYWxlKCBzeCwgc3kgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHJvdGF0ZSggdGhldGEgKSB7XG5cblx0XHR0aGlzLnByZW11bHRpcGx5KCBfbTMubWFrZVJvdGF0aW9uKCAtIHRoZXRhICkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR0cmFuc2xhdGUoIHR4LCB0eSApIHtcblxuXHRcdHRoaXMucHJlbXVsdGlwbHkoIF9tMy5tYWtlVHJhbnNsYXRpb24oIHR4LCB0eSApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Ly8gZm9yIDJEIFRyYW5zZm9ybXNcblxuXHRtYWtlVHJhbnNsYXRpb24oIHgsIHkgKSB7XG5cblx0XHRpZiAoIHguaXNWZWN0b3IyICkge1xuXG5cdFx0XHR0aGlzLnNldChcblxuXHRcdFx0XHQxLCAwLCB4LngsXG5cdFx0XHRcdDAsIDEsIHgueSxcblx0XHRcdFx0MCwgMCwgMVxuXG5cdFx0XHQpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dGhpcy5zZXQoXG5cblx0XHRcdFx0MSwgMCwgeCxcblx0XHRcdFx0MCwgMSwgeSxcblx0XHRcdFx0MCwgMCwgMVxuXG5cdFx0XHQpO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG1ha2VSb3RhdGlvbiggdGhldGEgKSB7XG5cblx0XHQvLyBjb3VudGVyY2xvY2t3aXNlXG5cblx0XHRjb25zdCBjID0gTWF0aC5jb3MoIHRoZXRhICk7XG5cdFx0Y29uc3QgcyA9IE1hdGguc2luKCB0aGV0YSApO1xuXG5cdFx0dGhpcy5zZXQoXG5cblx0XHRcdGMsIC0gcywgMCxcblx0XHRcdHMsIGMsIDAsXG5cdFx0XHQwLCAwLCAxXG5cblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG1ha2VTY2FsZSggeCwgeSApIHtcblxuXHRcdHRoaXMuc2V0KFxuXG5cdFx0XHR4LCAwLCAwLFxuXHRcdFx0MCwgeSwgMCxcblx0XHRcdDAsIDAsIDFcblxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Ly9cblxuXHRlcXVhbHMoIG1hdHJpeCApIHtcblxuXHRcdGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcblx0XHRjb25zdCBtZSA9IG1hdHJpeC5lbGVtZW50cztcblxuXHRcdGZvciAoIGxldCBpID0gMDsgaSA8IDk7IGkgKysgKSB7XG5cblx0XHRcdGlmICggdGVbIGkgXSAhPT0gbWVbIGkgXSApIHJldHVybiBmYWxzZTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH1cblxuXHRmcm9tQXJyYXkoIGFycmF5LCBvZmZzZXQgPSAwICkge1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgOTsgaSArKyApIHtcblxuXHRcdFx0dGhpcy5lbGVtZW50c1sgaSBdID0gYXJyYXlbIGkgKyBvZmZzZXQgXTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR0b0FycmF5KCBhcnJheSA9IFtdLCBvZmZzZXQgPSAwICkge1xuXG5cdFx0Y29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG5cdFx0YXJyYXlbIG9mZnNldCBdID0gdGVbIDAgXTtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMSBdID0gdGVbIDEgXTtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMiBdID0gdGVbIDIgXTtcblxuXHRcdGFycmF5WyBvZmZzZXQgKyAzIF0gPSB0ZVsgMyBdO1xuXHRcdGFycmF5WyBvZmZzZXQgKyA0IF0gPSB0ZVsgNCBdO1xuXHRcdGFycmF5WyBvZmZzZXQgKyA1IF0gPSB0ZVsgNSBdO1xuXG5cdFx0YXJyYXlbIG9mZnNldCArIDYgXSA9IHRlWyA2IF07XG5cdFx0YXJyYXlbIG9mZnNldCArIDcgXSA9IHRlWyA3IF07XG5cdFx0YXJyYXlbIG9mZnNldCArIDggXSA9IHRlWyA4IF07XG5cblx0XHRyZXR1cm4gYXJyYXk7XG5cblx0fVxuXG5cdGNsb25lKCkge1xuXG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCkuZnJvbUFycmF5KCB0aGlzLmVsZW1lbnRzICk7XG5cblx0fVxuXG59XG5cbmNvbnN0IF9tMyA9IC8qQF9fUFVSRV9fKi8gbmV3IE1hdHJpeDMoKTtcblxuZXhwb3J0IHsgTWF0cml4MyB9O1xuIiwiaW1wb3J0IHsgUXVhdGVybmlvbiB9IGZyb20gJy4uL21hdGgvUXVhdGVybmlvbi5qcyc7XG5pbXBvcnQgeyBWZWN0b3IzIH0gZnJvbSAnLi4vbWF0aC9WZWN0b3IzLmpzJztcbmltcG9ydCB7IE1hdHJpeDQgfSBmcm9tICcuLi9tYXRoL01hdHJpeDQuanMnO1xuaW1wb3J0IHsgRXZlbnREaXNwYXRjaGVyIH0gZnJvbSAnLi9FdmVudERpc3BhdGNoZXIuanMnO1xuaW1wb3J0IHsgRXVsZXIgfSBmcm9tICcuLi9tYXRoL0V1bGVyLmpzJztcbmltcG9ydCB7IExheWVycyB9IGZyb20gJy4vTGF5ZXJzLmpzJztcbmltcG9ydCB7IE1hdHJpeDMgfSBmcm9tICcuLi9tYXRoL01hdHJpeDMuanMnO1xuaW1wb3J0ICogYXMgTWF0aFV0aWxzIGZyb20gJy4uL21hdGgvTWF0aFV0aWxzLmpzJztcblxubGV0IF9vYmplY3QzRElkID0gMDtcblxuY29uc3QgX3YxID0gLypAX19QVVJFX18qLyBuZXcgVmVjdG9yMygpO1xuY29uc3QgX3ExID0gLypAX19QVVJFX18qLyBuZXcgUXVhdGVybmlvbigpO1xuY29uc3QgX20xID0gLypAX19QVVJFX18qLyBuZXcgTWF0cml4NCgpO1xuY29uc3QgX3RhcmdldCA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoKTtcblxuY29uc3QgX3Bvc2l0aW9uID0gLypAX19QVVJFX18qLyBuZXcgVmVjdG9yMygpO1xuY29uc3QgX3NjYWxlID0gLypAX19QVVJFX18qLyBuZXcgVmVjdG9yMygpO1xuY29uc3QgX3F1YXRlcm5pb24gPSAvKkBfX1BVUkVfXyovIG5ldyBRdWF0ZXJuaW9uKCk7XG5cbmNvbnN0IF94QXhpcyA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoIDEsIDAsIDAgKTtcbmNvbnN0IF95QXhpcyA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoIDAsIDEsIDAgKTtcbmNvbnN0IF96QXhpcyA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoIDAsIDAsIDEgKTtcblxuY29uc3QgX2FkZGVkRXZlbnQgPSB7IHR5cGU6ICdhZGRlZCcgfTtcbmNvbnN0IF9yZW1vdmVkRXZlbnQgPSB7IHR5cGU6ICdyZW1vdmVkJyB9O1xuXG5jbGFzcyBPYmplY3QzRCBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlciB7XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5pc09iamVjdDNEID0gdHJ1ZTtcblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ2lkJywgeyB2YWx1ZTogX29iamVjdDNESWQgKysgfSApO1xuXG5cdFx0dGhpcy51dWlkID0gTWF0aFV0aWxzLmdlbmVyYXRlVVVJRCgpO1xuXG5cdFx0dGhpcy5uYW1lID0gJyc7XG5cdFx0dGhpcy50eXBlID0gJ09iamVjdDNEJztcblxuXHRcdHRoaXMucGFyZW50ID0gbnVsbDtcblx0XHR0aGlzLmNoaWxkcmVuID0gW107XG5cblx0XHR0aGlzLnVwID0gT2JqZWN0M0QuREVGQVVMVF9VUC5jbG9uZSgpO1xuXG5cdFx0Y29uc3QgcG9zaXRpb24gPSBuZXcgVmVjdG9yMygpO1xuXHRcdGNvbnN0IHJvdGF0aW9uID0gbmV3IEV1bGVyKCk7XG5cdFx0Y29uc3QgcXVhdGVybmlvbiA9IG5ldyBRdWF0ZXJuaW9uKCk7XG5cdFx0Y29uc3Qgc2NhbGUgPSBuZXcgVmVjdG9yMyggMSwgMSwgMSApO1xuXG5cdFx0ZnVuY3Rpb24gb25Sb3RhdGlvbkNoYW5nZSgpIHtcblxuXHRcdFx0cXVhdGVybmlvbi5zZXRGcm9tRXVsZXIoIHJvdGF0aW9uLCBmYWxzZSApO1xuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gb25RdWF0ZXJuaW9uQ2hhbmdlKCkge1xuXG5cdFx0XHRyb3RhdGlvbi5zZXRGcm9tUXVhdGVybmlvbiggcXVhdGVybmlvbiwgdW5kZWZpbmVkLCBmYWxzZSApO1xuXG5cdFx0fVxuXG5cdFx0cm90YXRpb24uX29uQ2hhbmdlKCBvblJvdGF0aW9uQ2hhbmdlICk7XG5cdFx0cXVhdGVybmlvbi5fb25DaGFuZ2UoIG9uUXVhdGVybmlvbkNoYW5nZSApO1xuXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIHRoaXMsIHtcblx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdFx0dmFsdWU6IHBvc2l0aW9uXG5cdFx0XHR9LFxuXHRcdFx0cm90YXRpb246IHtcblx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxuXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0XHR2YWx1ZTogcm90YXRpb25cblx0XHRcdH0sXG5cdFx0XHRxdWF0ZXJuaW9uOiB7XG5cdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdFx0dmFsdWU6IHF1YXRlcm5pb25cblx0XHRcdH0sXG5cdFx0XHRzY2FsZToge1xuXHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0XHRcdHZhbHVlOiBzY2FsZVxuXHRcdFx0fSxcblx0XHRcdG1vZGVsVmlld01hdHJpeDoge1xuXHRcdFx0XHR2YWx1ZTogbmV3IE1hdHJpeDQoKVxuXHRcdFx0fSxcblx0XHRcdG5vcm1hbE1hdHJpeDoge1xuXHRcdFx0XHR2YWx1ZTogbmV3IE1hdHJpeDMoKVxuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdHRoaXMubWF0cml4ID0gbmV3IE1hdHJpeDQoKTtcblx0XHR0aGlzLm1hdHJpeFdvcmxkID0gbmV3IE1hdHJpeDQoKTtcblxuXHRcdHRoaXMubWF0cml4QXV0b1VwZGF0ZSA9IE9iamVjdDNELkRFRkFVTFRfTUFUUklYX0FVVE9fVVBEQVRFO1xuXHRcdHRoaXMubWF0cml4V29ybGROZWVkc1VwZGF0ZSA9IGZhbHNlO1xuXG5cdFx0dGhpcy5tYXRyaXhXb3JsZEF1dG9VcGRhdGUgPSBPYmplY3QzRC5ERUZBVUxUX01BVFJJWF9XT1JMRF9BVVRPX1VQREFURTsgLy8gY2hlY2tlZCBieSB0aGUgcmVuZGVyZXJcblxuXHRcdHRoaXMubGF5ZXJzID0gbmV3IExheWVycygpO1xuXHRcdHRoaXMudmlzaWJsZSA9IHRydWU7XG5cblx0XHR0aGlzLmNhc3RTaGFkb3cgPSBmYWxzZTtcblx0XHR0aGlzLnJlY2VpdmVTaGFkb3cgPSBmYWxzZTtcblxuXHRcdHRoaXMuZnJ1c3R1bUN1bGxlZCA9IHRydWU7XG5cdFx0dGhpcy5yZW5kZXJPcmRlciA9IDA7XG5cblx0XHR0aGlzLmFuaW1hdGlvbnMgPSBbXTtcblxuXHRcdHRoaXMudXNlckRhdGEgPSB7fTtcblxuXHR9XG5cblx0b25CZWZvcmVSZW5kZXIoIC8qIHJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhLCBnZW9tZXRyeSwgbWF0ZXJpYWwsIGdyb3VwICovICkge31cblxuXHRvbkFmdGVyUmVuZGVyKCAvKiByZW5kZXJlciwgc2NlbmUsIGNhbWVyYSwgZ2VvbWV0cnksIG1hdGVyaWFsLCBncm91cCAqLyApIHt9XG5cblx0YXBwbHlNYXRyaXg0KCBtYXRyaXggKSB7XG5cblx0XHRpZiAoIHRoaXMubWF0cml4QXV0b1VwZGF0ZSApIHRoaXMudXBkYXRlTWF0cml4KCk7XG5cblx0XHR0aGlzLm1hdHJpeC5wcmVtdWx0aXBseSggbWF0cml4ICk7XG5cblx0XHR0aGlzLm1hdHJpeC5kZWNvbXBvc2UoIHRoaXMucG9zaXRpb24sIHRoaXMucXVhdGVybmlvbiwgdGhpcy5zY2FsZSApO1xuXG5cdH1cblxuXHRhcHBseVF1YXRlcm5pb24oIHEgKSB7XG5cblx0XHR0aGlzLnF1YXRlcm5pb24ucHJlbXVsdGlwbHkoIHEgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRSb3RhdGlvbkZyb21BeGlzQW5nbGUoIGF4aXMsIGFuZ2xlICkge1xuXG5cdFx0Ly8gYXNzdW1lcyBheGlzIGlzIG5vcm1hbGl6ZWRcblxuXHRcdHRoaXMucXVhdGVybmlvbi5zZXRGcm9tQXhpc0FuZ2xlKCBheGlzLCBhbmdsZSApO1xuXG5cdH1cblxuXHRzZXRSb3RhdGlvbkZyb21FdWxlciggZXVsZXIgKSB7XG5cblx0XHR0aGlzLnF1YXRlcm5pb24uc2V0RnJvbUV1bGVyKCBldWxlciwgdHJ1ZSApO1xuXG5cdH1cblxuXHRzZXRSb3RhdGlvbkZyb21NYXRyaXgoIG0gKSB7XG5cblx0XHQvLyBhc3N1bWVzIHRoZSB1cHBlciAzeDMgb2YgbSBpcyBhIHB1cmUgcm90YXRpb24gbWF0cml4IChpLmUsIHVuc2NhbGVkKVxuXG5cdFx0dGhpcy5xdWF0ZXJuaW9uLnNldEZyb21Sb3RhdGlvbk1hdHJpeCggbSApO1xuXG5cdH1cblxuXHRzZXRSb3RhdGlvbkZyb21RdWF0ZXJuaW9uKCBxICkge1xuXG5cdFx0Ly8gYXNzdW1lcyBxIGlzIG5vcm1hbGl6ZWRcblxuXHRcdHRoaXMucXVhdGVybmlvbi5jb3B5KCBxICk7XG5cblx0fVxuXG5cdHJvdGF0ZU9uQXhpcyggYXhpcywgYW5nbGUgKSB7XG5cblx0XHQvLyByb3RhdGUgb2JqZWN0IG9uIGF4aXMgaW4gb2JqZWN0IHNwYWNlXG5cdFx0Ly8gYXhpcyBpcyBhc3N1bWVkIHRvIGJlIG5vcm1hbGl6ZWRcblxuXHRcdF9xMS5zZXRGcm9tQXhpc0FuZ2xlKCBheGlzLCBhbmdsZSApO1xuXG5cdFx0dGhpcy5xdWF0ZXJuaW9uLm11bHRpcGx5KCBfcTEgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRyb3RhdGVPbldvcmxkQXhpcyggYXhpcywgYW5nbGUgKSB7XG5cblx0XHQvLyByb3RhdGUgb2JqZWN0IG9uIGF4aXMgaW4gd29ybGQgc3BhY2Vcblx0XHQvLyBheGlzIGlzIGFzc3VtZWQgdG8gYmUgbm9ybWFsaXplZFxuXHRcdC8vIG1ldGhvZCBhc3N1bWVzIG5vIHJvdGF0ZWQgcGFyZW50XG5cblx0XHRfcTEuc2V0RnJvbUF4aXNBbmdsZSggYXhpcywgYW5nbGUgKTtcblxuXHRcdHRoaXMucXVhdGVybmlvbi5wcmVtdWx0aXBseSggX3ExICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0cm90YXRlWCggYW5nbGUgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5yb3RhdGVPbkF4aXMoIF94QXhpcywgYW5nbGUgKTtcblxuXHR9XG5cblx0cm90YXRlWSggYW5nbGUgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5yb3RhdGVPbkF4aXMoIF95QXhpcywgYW5nbGUgKTtcblxuXHR9XG5cblx0cm90YXRlWiggYW5nbGUgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5yb3RhdGVPbkF4aXMoIF96QXhpcywgYW5nbGUgKTtcblxuXHR9XG5cblx0dHJhbnNsYXRlT25BeGlzKCBheGlzLCBkaXN0YW5jZSApIHtcblxuXHRcdC8vIHRyYW5zbGF0ZSBvYmplY3QgYnkgZGlzdGFuY2UgYWxvbmcgYXhpcyBpbiBvYmplY3Qgc3BhY2Vcblx0XHQvLyBheGlzIGlzIGFzc3VtZWQgdG8gYmUgbm9ybWFsaXplZFxuXG5cdFx0X3YxLmNvcHkoIGF4aXMgKS5hcHBseVF1YXRlcm5pb24oIHRoaXMucXVhdGVybmlvbiApO1xuXG5cdFx0dGhpcy5wb3NpdGlvbi5hZGQoIF92MS5tdWx0aXBseVNjYWxhciggZGlzdGFuY2UgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHRyYW5zbGF0ZVgoIGRpc3RhbmNlICkge1xuXG5cdFx0cmV0dXJuIHRoaXMudHJhbnNsYXRlT25BeGlzKCBfeEF4aXMsIGRpc3RhbmNlICk7XG5cblx0fVxuXG5cdHRyYW5zbGF0ZVkoIGRpc3RhbmNlICkge1xuXG5cdFx0cmV0dXJuIHRoaXMudHJhbnNsYXRlT25BeGlzKCBfeUF4aXMsIGRpc3RhbmNlICk7XG5cblx0fVxuXG5cdHRyYW5zbGF0ZVooIGRpc3RhbmNlICkge1xuXG5cdFx0cmV0dXJuIHRoaXMudHJhbnNsYXRlT25BeGlzKCBfekF4aXMsIGRpc3RhbmNlICk7XG5cblx0fVxuXG5cdGxvY2FsVG9Xb3JsZCggdmVjdG9yICkge1xuXG5cdFx0dGhpcy51cGRhdGVXb3JsZE1hdHJpeCggdHJ1ZSwgZmFsc2UgKTtcblxuXHRcdHJldHVybiB2ZWN0b3IuYXBwbHlNYXRyaXg0KCB0aGlzLm1hdHJpeFdvcmxkICk7XG5cblx0fVxuXG5cdHdvcmxkVG9Mb2NhbCggdmVjdG9yICkge1xuXG5cdFx0dGhpcy51cGRhdGVXb3JsZE1hdHJpeCggdHJ1ZSwgZmFsc2UgKTtcblxuXHRcdHJldHVybiB2ZWN0b3IuYXBwbHlNYXRyaXg0KCBfbTEuY29weSggdGhpcy5tYXRyaXhXb3JsZCApLmludmVydCgpICk7XG5cblx0fVxuXG5cdGxvb2tBdCggeCwgeSwgeiApIHtcblxuXHRcdC8vIFRoaXMgbWV0aG9kIGRvZXMgbm90IHN1cHBvcnQgb2JqZWN0cyBoYXZpbmcgbm9uLXVuaWZvcm1seS1zY2FsZWQgcGFyZW50KHMpXG5cblx0XHRpZiAoIHguaXNWZWN0b3IzICkge1xuXG5cdFx0XHRfdGFyZ2V0LmNvcHkoIHggKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdF90YXJnZXQuc2V0KCB4LCB5LCB6ICk7XG5cblx0XHR9XG5cblx0XHRjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudDtcblxuXHRcdHRoaXMudXBkYXRlV29ybGRNYXRyaXgoIHRydWUsIGZhbHNlICk7XG5cblx0XHRfcG9zaXRpb24uc2V0RnJvbU1hdHJpeFBvc2l0aW9uKCB0aGlzLm1hdHJpeFdvcmxkICk7XG5cblx0XHRpZiAoIHRoaXMuaXNDYW1lcmEgfHwgdGhpcy5pc0xpZ2h0ICkge1xuXG5cdFx0XHRfbTEubG9va0F0KCBfcG9zaXRpb24sIF90YXJnZXQsIHRoaXMudXAgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdF9tMS5sb29rQXQoIF90YXJnZXQsIF9wb3NpdGlvbiwgdGhpcy51cCApO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5xdWF0ZXJuaW9uLnNldEZyb21Sb3RhdGlvbk1hdHJpeCggX20xICk7XG5cblx0XHRpZiAoIHBhcmVudCApIHtcblxuXHRcdFx0X20xLmV4dHJhY3RSb3RhdGlvbiggcGFyZW50Lm1hdHJpeFdvcmxkICk7XG5cdFx0XHRfcTEuc2V0RnJvbVJvdGF0aW9uTWF0cml4KCBfbTEgKTtcblx0XHRcdHRoaXMucXVhdGVybmlvbi5wcmVtdWx0aXBseSggX3ExLmludmVydCgpICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdGFkZCggb2JqZWN0ICkge1xuXG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID4gMSApIHtcblxuXHRcdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSArKyApIHtcblxuXHRcdFx0XHR0aGlzLmFkZCggYXJndW1lbnRzWyBpIF0gKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcztcblxuXHRcdH1cblxuXHRcdGlmICggb2JqZWN0ID09PSB0aGlzICkge1xuXG5cdFx0XHRjb25zb2xlLmVycm9yKCAnVEhSRUUuT2JqZWN0M0QuYWRkOiBvYmplY3QgY2FuXFwndCBiZSBhZGRlZCBhcyBhIGNoaWxkIG9mIGl0c2VsZi4nLCBvYmplY3QgKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBvYmplY3QgJiYgb2JqZWN0LmlzT2JqZWN0M0QgKSB7XG5cblx0XHRcdGlmICggb2JqZWN0LnBhcmVudCAhPT0gbnVsbCApIHtcblxuXHRcdFx0XHRvYmplY3QucGFyZW50LnJlbW92ZSggb2JqZWN0ICk7XG5cblx0XHRcdH1cblxuXHRcdFx0b2JqZWN0LnBhcmVudCA9IHRoaXM7XG5cdFx0XHR0aGlzLmNoaWxkcmVuLnB1c2goIG9iamVjdCApO1xuXG5cdFx0XHRvYmplY3QuZGlzcGF0Y2hFdmVudCggX2FkZGVkRXZlbnQgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGNvbnNvbGUuZXJyb3IoICdUSFJFRS5PYmplY3QzRC5hZGQ6IG9iamVjdCBub3QgYW4gaW5zdGFuY2Ugb2YgVEhSRUUuT2JqZWN0M0QuJywgb2JqZWN0ICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0cmVtb3ZlKCBvYmplY3QgKSB7XG5cblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPiAxICkge1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpICsrICkge1xuXG5cdFx0XHRcdHRoaXMucmVtb3ZlKCBhcmd1bWVudHNbIGkgXSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgaW5kZXggPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YoIG9iamVjdCApO1xuXG5cdFx0aWYgKCBpbmRleCAhPT0gLSAxICkge1xuXG5cdFx0XHRvYmplY3QucGFyZW50ID0gbnVsbDtcblx0XHRcdHRoaXMuY2hpbGRyZW4uc3BsaWNlKCBpbmRleCwgMSApO1xuXG5cdFx0XHRvYmplY3QuZGlzcGF0Y2hFdmVudCggX3JlbW92ZWRFdmVudCApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHJlbW92ZUZyb21QYXJlbnQoKSB7XG5cblx0XHRjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudDtcblxuXHRcdGlmICggcGFyZW50ICE9PSBudWxsICkge1xuXG5cdFx0XHRwYXJlbnQucmVtb3ZlKCB0aGlzICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y2xlYXIoKSB7XG5cblx0XHRmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSArKyApIHtcblxuXHRcdFx0Y29uc3Qgb2JqZWN0ID0gdGhpcy5jaGlsZHJlblsgaSBdO1xuXG5cdFx0XHRvYmplY3QucGFyZW50ID0gbnVsbDtcblxuXHRcdFx0b2JqZWN0LmRpc3BhdGNoRXZlbnQoIF9yZW1vdmVkRXZlbnQgKTtcblxuXHRcdH1cblxuXHRcdHRoaXMuY2hpbGRyZW4ubGVuZ3RoID0gMDtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cblx0fVxuXG5cdGF0dGFjaCggb2JqZWN0ICkge1xuXG5cdFx0Ly8gYWRkcyBvYmplY3QgYXMgYSBjaGlsZCBvZiB0aGlzLCB3aGlsZSBtYWludGFpbmluZyB0aGUgb2JqZWN0J3Mgd29ybGQgdHJhbnNmb3JtXG5cblx0XHQvLyBOb3RlOiBUaGlzIG1ldGhvZCBkb2VzIG5vdCBzdXBwb3J0IHNjZW5lIGdyYXBocyBoYXZpbmcgbm9uLXVuaWZvcm1seS1zY2FsZWQgbm9kZXMocylcblxuXHRcdHRoaXMudXBkYXRlV29ybGRNYXRyaXgoIHRydWUsIGZhbHNlICk7XG5cblx0XHRfbTEuY29weSggdGhpcy5tYXRyaXhXb3JsZCApLmludmVydCgpO1xuXG5cdFx0aWYgKCBvYmplY3QucGFyZW50ICE9PSBudWxsICkge1xuXG5cdFx0XHRvYmplY3QucGFyZW50LnVwZGF0ZVdvcmxkTWF0cml4KCB0cnVlLCBmYWxzZSApO1xuXG5cdFx0XHRfbTEubXVsdGlwbHkoIG9iamVjdC5wYXJlbnQubWF0cml4V29ybGQgKTtcblxuXHRcdH1cblxuXHRcdG9iamVjdC5hcHBseU1hdHJpeDQoIF9tMSApO1xuXG5cdFx0dGhpcy5hZGQoIG9iamVjdCApO1xuXG5cdFx0b2JqZWN0LnVwZGF0ZVdvcmxkTWF0cml4KCBmYWxzZSwgdHJ1ZSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGdldE9iamVjdEJ5SWQoIGlkICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuZ2V0T2JqZWN0QnlQcm9wZXJ0eSggJ2lkJywgaWQgKTtcblxuXHR9XG5cblx0Z2V0T2JqZWN0QnlOYW1lKCBuYW1lICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuZ2V0T2JqZWN0QnlQcm9wZXJ0eSggJ25hbWUnLCBuYW1lICk7XG5cblx0fVxuXG5cdGdldE9iamVjdEJ5UHJvcGVydHkoIG5hbWUsIHZhbHVlICkge1xuXG5cdFx0aWYgKCB0aGlzWyBuYW1lIF0gPT09IHZhbHVlICkgcmV0dXJuIHRoaXM7XG5cblx0XHRmb3IgKCBsZXQgaSA9IDAsIGwgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkgKysgKSB7XG5cblx0XHRcdGNvbnN0IGNoaWxkID0gdGhpcy5jaGlsZHJlblsgaSBdO1xuXHRcdFx0Y29uc3Qgb2JqZWN0ID0gY2hpbGQuZ2V0T2JqZWN0QnlQcm9wZXJ0eSggbmFtZSwgdmFsdWUgKTtcblxuXHRcdFx0aWYgKCBvYmplY3QgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRyZXR1cm4gb2JqZWN0O1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXG5cdH1cblxuXHRnZXRPYmplY3RzQnlQcm9wZXJ0eSggbmFtZSwgdmFsdWUgKSB7XG5cblx0XHRsZXQgcmVzdWx0ID0gW107XG5cblx0XHRpZiAoIHRoaXNbIG5hbWUgXSA9PT0gdmFsdWUgKSByZXN1bHQucHVzaCggdGhpcyApO1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwLCBsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRjb25zdCBjaGlsZFJlc3VsdCA9IHRoaXMuY2hpbGRyZW5bIGkgXS5nZXRPYmplY3RzQnlQcm9wZXJ0eSggbmFtZSwgdmFsdWUgKTtcblxuXHRcdFx0aWYgKCBjaGlsZFJlc3VsdC5sZW5ndGggPiAwICkge1xuXG5cdFx0XHRcdHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoIGNoaWxkUmVzdWx0ICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cblx0fVxuXG5cdGdldFdvcmxkUG9zaXRpb24oIHRhcmdldCApIHtcblxuXHRcdHRoaXMudXBkYXRlV29ybGRNYXRyaXgoIHRydWUsIGZhbHNlICk7XG5cblx0XHRyZXR1cm4gdGFyZ2V0LnNldEZyb21NYXRyaXhQb3NpdGlvbiggdGhpcy5tYXRyaXhXb3JsZCApO1xuXG5cdH1cblxuXHRnZXRXb3JsZFF1YXRlcm5pb24oIHRhcmdldCApIHtcblxuXHRcdHRoaXMudXBkYXRlV29ybGRNYXRyaXgoIHRydWUsIGZhbHNlICk7XG5cblx0XHR0aGlzLm1hdHJpeFdvcmxkLmRlY29tcG9zZSggX3Bvc2l0aW9uLCB0YXJnZXQsIF9zY2FsZSApO1xuXG5cdFx0cmV0dXJuIHRhcmdldDtcblxuXHR9XG5cblx0Z2V0V29ybGRTY2FsZSggdGFyZ2V0ICkge1xuXG5cdFx0dGhpcy51cGRhdGVXb3JsZE1hdHJpeCggdHJ1ZSwgZmFsc2UgKTtcblxuXHRcdHRoaXMubWF0cml4V29ybGQuZGVjb21wb3NlKCBfcG9zaXRpb24sIF9xdWF0ZXJuaW9uLCB0YXJnZXQgKTtcblxuXHRcdHJldHVybiB0YXJnZXQ7XG5cblx0fVxuXG5cdGdldFdvcmxkRGlyZWN0aW9uKCB0YXJnZXQgKSB7XG5cblx0XHR0aGlzLnVwZGF0ZVdvcmxkTWF0cml4KCB0cnVlLCBmYWxzZSApO1xuXG5cdFx0Y29uc3QgZSA9IHRoaXMubWF0cml4V29ybGQuZWxlbWVudHM7XG5cblx0XHRyZXR1cm4gdGFyZ2V0LnNldCggZVsgOCBdLCBlWyA5IF0sIGVbIDEwIF0gKS5ub3JtYWxpemUoKTtcblxuXHR9XG5cblx0cmF5Y2FzdCggLyogcmF5Y2FzdGVyLCBpbnRlcnNlY3RzICovICkge31cblxuXHR0cmF2ZXJzZSggY2FsbGJhY2sgKSB7XG5cblx0XHRjYWxsYmFjayggdGhpcyApO1xuXG5cdFx0Y29uc3QgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuO1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSArKyApIHtcblxuXHRcdFx0Y2hpbGRyZW5bIGkgXS50cmF2ZXJzZSggY2FsbGJhY2sgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0dHJhdmVyc2VWaXNpYmxlKCBjYWxsYmFjayApIHtcblxuXHRcdGlmICggdGhpcy52aXNpYmxlID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGNhbGxiYWNrKCB0aGlzICk7XG5cblx0XHRjb25zdCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW47XG5cblx0XHRmb3IgKCBsZXQgaSA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRjaGlsZHJlblsgaSBdLnRyYXZlcnNlVmlzaWJsZSggY2FsbGJhY2sgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0dHJhdmVyc2VBbmNlc3RvcnMoIGNhbGxiYWNrICkge1xuXG5cdFx0Y29uc3QgcGFyZW50ID0gdGhpcy5wYXJlbnQ7XG5cblx0XHRpZiAoIHBhcmVudCAhPT0gbnVsbCApIHtcblxuXHRcdFx0Y2FsbGJhY2soIHBhcmVudCApO1xuXG5cdFx0XHRwYXJlbnQudHJhdmVyc2VBbmNlc3RvcnMoIGNhbGxiYWNrICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdHVwZGF0ZU1hdHJpeCgpIHtcblxuXHRcdHRoaXMubWF0cml4LmNvbXBvc2UoIHRoaXMucG9zaXRpb24sIHRoaXMucXVhdGVybmlvbiwgdGhpcy5zY2FsZSApO1xuXG5cdFx0dGhpcy5tYXRyaXhXb3JsZE5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuXHR9XG5cblx0dXBkYXRlTWF0cml4V29ybGQoIGZvcmNlICkge1xuXG5cdFx0aWYgKCB0aGlzLm1hdHJpeEF1dG9VcGRhdGUgKSB0aGlzLnVwZGF0ZU1hdHJpeCgpO1xuXG5cdFx0aWYgKCB0aGlzLm1hdHJpeFdvcmxkTmVlZHNVcGRhdGUgfHwgZm9yY2UgKSB7XG5cblx0XHRcdGlmICggdGhpcy5wYXJlbnQgPT09IG51bGwgKSB7XG5cblx0XHRcdFx0dGhpcy5tYXRyaXhXb3JsZC5jb3B5KCB0aGlzLm1hdHJpeCApO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdHRoaXMubWF0cml4V29ybGQubXVsdGlwbHlNYXRyaWNlcyggdGhpcy5wYXJlbnQubWF0cml4V29ybGQsIHRoaXMubWF0cml4ICk7XG5cblx0XHRcdH1cblxuXHRcdFx0dGhpcy5tYXRyaXhXb3JsZE5lZWRzVXBkYXRlID0gZmFsc2U7XG5cblx0XHRcdGZvcmNlID0gdHJ1ZTtcblxuXHRcdH1cblxuXHRcdC8vIHVwZGF0ZSBjaGlsZHJlblxuXG5cdFx0Y29uc3QgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuO1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSArKyApIHtcblxuXHRcdFx0Y29uc3QgY2hpbGQgPSBjaGlsZHJlblsgaSBdO1xuXG5cdFx0XHRpZiAoIGNoaWxkLm1hdHJpeFdvcmxkQXV0b1VwZGF0ZSA9PT0gdHJ1ZSB8fCBmb3JjZSA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0XHRjaGlsZC51cGRhdGVNYXRyaXhXb3JsZCggZm9yY2UgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cblxuXHR1cGRhdGVXb3JsZE1hdHJpeCggdXBkYXRlUGFyZW50cywgdXBkYXRlQ2hpbGRyZW4gKSB7XG5cblx0XHRjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudDtcblxuXHRcdGlmICggdXBkYXRlUGFyZW50cyA9PT0gdHJ1ZSAmJiBwYXJlbnQgIT09IG51bGwgJiYgcGFyZW50Lm1hdHJpeFdvcmxkQXV0b1VwZGF0ZSA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0cGFyZW50LnVwZGF0ZVdvcmxkTWF0cml4KCB0cnVlLCBmYWxzZSApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLm1hdHJpeEF1dG9VcGRhdGUgKSB0aGlzLnVwZGF0ZU1hdHJpeCgpO1xuXG5cdFx0aWYgKCB0aGlzLnBhcmVudCA9PT0gbnVsbCApIHtcblxuXHRcdFx0dGhpcy5tYXRyaXhXb3JsZC5jb3B5KCB0aGlzLm1hdHJpeCApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dGhpcy5tYXRyaXhXb3JsZC5tdWx0aXBseU1hdHJpY2VzKCB0aGlzLnBhcmVudC5tYXRyaXhXb3JsZCwgdGhpcy5tYXRyaXggKTtcblxuXHRcdH1cblxuXHRcdC8vIHVwZGF0ZSBjaGlsZHJlblxuXG5cdFx0aWYgKCB1cGRhdGVDaGlsZHJlbiA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0Y29uc3QgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuO1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRcdGNvbnN0IGNoaWxkID0gY2hpbGRyZW5bIGkgXTtcblxuXHRcdFx0XHRpZiAoIGNoaWxkLm1hdHJpeFdvcmxkQXV0b1VwZGF0ZSA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0XHRcdGNoaWxkLnVwZGF0ZVdvcmxkTWF0cml4KCBmYWxzZSwgdHJ1ZSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cblxuXHR0b0pTT04oIG1ldGEgKSB7XG5cblx0XHQvLyBtZXRhIGlzIGEgc3RyaW5nIHdoZW4gY2FsbGVkIGZyb20gSlNPTi5zdHJpbmdpZnlcblx0XHRjb25zdCBpc1Jvb3RPYmplY3QgPSAoIG1ldGEgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgbWV0YSA9PT0gJ3N0cmluZycgKTtcblxuXHRcdGNvbnN0IG91dHB1dCA9IHt9O1xuXG5cdFx0Ly8gbWV0YSBpcyBhIGhhc2ggdXNlZCB0byBjb2xsZWN0IGdlb21ldHJpZXMsIG1hdGVyaWFscy5cblx0XHQvLyBub3QgcHJvdmlkaW5nIGl0IGltcGxpZXMgdGhhdCB0aGlzIGlzIHRoZSByb290IG9iamVjdFxuXHRcdC8vIGJlaW5nIHNlcmlhbGl6ZWQuXG5cdFx0aWYgKCBpc1Jvb3RPYmplY3QgKSB7XG5cblx0XHRcdC8vIGluaXRpYWxpemUgbWV0YSBvYmpcblx0XHRcdG1ldGEgPSB7XG5cdFx0XHRcdGdlb21ldHJpZXM6IHt9LFxuXHRcdFx0XHRtYXRlcmlhbHM6IHt9LFxuXHRcdFx0XHR0ZXh0dXJlczoge30sXG5cdFx0XHRcdGltYWdlczoge30sXG5cdFx0XHRcdHNoYXBlczoge30sXG5cdFx0XHRcdHNrZWxldG9uczoge30sXG5cdFx0XHRcdGFuaW1hdGlvbnM6IHt9LFxuXHRcdFx0XHRub2Rlczoge31cblx0XHRcdH07XG5cblx0XHRcdG91dHB1dC5tZXRhZGF0YSA9IHtcblx0XHRcdFx0dmVyc2lvbjogNC42LFxuXHRcdFx0XHR0eXBlOiAnT2JqZWN0Jyxcblx0XHRcdFx0Z2VuZXJhdG9yOiAnT2JqZWN0M0QudG9KU09OJ1xuXHRcdFx0fTtcblxuXHRcdH1cblxuXHRcdC8vIHN0YW5kYXJkIE9iamVjdDNEIHNlcmlhbGl6YXRpb25cblxuXHRcdGNvbnN0IG9iamVjdCA9IHt9O1xuXG5cdFx0b2JqZWN0LnV1aWQgPSB0aGlzLnV1aWQ7XG5cdFx0b2JqZWN0LnR5cGUgPSB0aGlzLnR5cGU7XG5cblx0XHRpZiAoIHRoaXMubmFtZSAhPT0gJycgKSBvYmplY3QubmFtZSA9IHRoaXMubmFtZTtcblx0XHRpZiAoIHRoaXMuY2FzdFNoYWRvdyA9PT0gdHJ1ZSApIG9iamVjdC5jYXN0U2hhZG93ID0gdHJ1ZTtcblx0XHRpZiAoIHRoaXMucmVjZWl2ZVNoYWRvdyA9PT0gdHJ1ZSApIG9iamVjdC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcblx0XHRpZiAoIHRoaXMudmlzaWJsZSA9PT0gZmFsc2UgKSBvYmplY3QudmlzaWJsZSA9IGZhbHNlO1xuXHRcdGlmICggdGhpcy5mcnVzdHVtQ3VsbGVkID09PSBmYWxzZSApIG9iamVjdC5mcnVzdHVtQ3VsbGVkID0gZmFsc2U7XG5cdFx0aWYgKCB0aGlzLnJlbmRlck9yZGVyICE9PSAwICkgb2JqZWN0LnJlbmRlck9yZGVyID0gdGhpcy5yZW5kZXJPcmRlcjtcblx0XHRpZiAoIE9iamVjdC5rZXlzKCB0aGlzLnVzZXJEYXRhICkubGVuZ3RoID4gMCApIG9iamVjdC51c2VyRGF0YSA9IHRoaXMudXNlckRhdGE7XG5cblx0XHRvYmplY3QubGF5ZXJzID0gdGhpcy5sYXllcnMubWFzaztcblx0XHRvYmplY3QubWF0cml4ID0gdGhpcy5tYXRyaXgudG9BcnJheSgpO1xuXHRcdG9iamVjdC51cCA9IHRoaXMudXAudG9BcnJheSgpO1xuXG5cdFx0aWYgKCB0aGlzLm1hdHJpeEF1dG9VcGRhdGUgPT09IGZhbHNlICkgb2JqZWN0Lm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcblxuXHRcdC8vIG9iamVjdCBzcGVjaWZpYyBwcm9wZXJ0aWVzXG5cblx0XHRpZiAoIHRoaXMuaXNJbnN0YW5jZWRNZXNoICkge1xuXG5cdFx0XHRvYmplY3QudHlwZSA9ICdJbnN0YW5jZWRNZXNoJztcblx0XHRcdG9iamVjdC5jb3VudCA9IHRoaXMuY291bnQ7XG5cdFx0XHRvYmplY3QuaW5zdGFuY2VNYXRyaXggPSB0aGlzLmluc3RhbmNlTWF0cml4LnRvSlNPTigpO1xuXHRcdFx0aWYgKCB0aGlzLmluc3RhbmNlQ29sb3IgIT09IG51bGwgKSBvYmplY3QuaW5zdGFuY2VDb2xvciA9IHRoaXMuaW5zdGFuY2VDb2xvci50b0pTT04oKTtcblxuXHRcdH1cblxuXHRcdC8vXG5cblx0XHRmdW5jdGlvbiBzZXJpYWxpemUoIGxpYnJhcnksIGVsZW1lbnQgKSB7XG5cblx0XHRcdGlmICggbGlicmFyeVsgZWxlbWVudC51dWlkIF0gPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRsaWJyYXJ5WyBlbGVtZW50LnV1aWQgXSA9IGVsZW1lbnQudG9KU09OKCBtZXRhICk7XG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGVsZW1lbnQudXVpZDtcblxuXHRcdH1cblxuXHRcdGlmICggdGhpcy5pc1NjZW5lICkge1xuXG5cdFx0XHRpZiAoIHRoaXMuYmFja2dyb3VuZCApIHtcblxuXHRcdFx0XHRpZiAoIHRoaXMuYmFja2dyb3VuZC5pc0NvbG9yICkge1xuXG5cdFx0XHRcdFx0b2JqZWN0LmJhY2tncm91bmQgPSB0aGlzLmJhY2tncm91bmQudG9KU09OKCk7XG5cblx0XHRcdFx0fSBlbHNlIGlmICggdGhpcy5iYWNrZ3JvdW5kLmlzVGV4dHVyZSApIHtcblxuXHRcdFx0XHRcdG9iamVjdC5iYWNrZ3JvdW5kID0gdGhpcy5iYWNrZ3JvdW5kLnRvSlNPTiggbWV0YSApLnV1aWQ7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggdGhpcy5lbnZpcm9ubWVudCAmJiB0aGlzLmVudmlyb25tZW50LmlzVGV4dHVyZSAmJiB0aGlzLmVudmlyb25tZW50LmlzUmVuZGVyVGFyZ2V0VGV4dHVyZSAhPT0gdHJ1ZSApIHtcblxuXHRcdFx0XHRvYmplY3QuZW52aXJvbm1lbnQgPSB0aGlzLmVudmlyb25tZW50LnRvSlNPTiggbWV0YSApLnV1aWQ7XG5cblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZiAoIHRoaXMuaXNNZXNoIHx8IHRoaXMuaXNMaW5lIHx8IHRoaXMuaXNQb2ludHMgKSB7XG5cblx0XHRcdG9iamVjdC5nZW9tZXRyeSA9IHNlcmlhbGl6ZSggbWV0YS5nZW9tZXRyaWVzLCB0aGlzLmdlb21ldHJ5ICk7XG5cblx0XHRcdGNvbnN0IHBhcmFtZXRlcnMgPSB0aGlzLmdlb21ldHJ5LnBhcmFtZXRlcnM7XG5cblx0XHRcdGlmICggcGFyYW1ldGVycyAhPT0gdW5kZWZpbmVkICYmIHBhcmFtZXRlcnMuc2hhcGVzICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0Y29uc3Qgc2hhcGVzID0gcGFyYW1ldGVycy5zaGFwZXM7XG5cblx0XHRcdFx0aWYgKCBBcnJheS5pc0FycmF5KCBzaGFwZXMgKSApIHtcblxuXHRcdFx0XHRcdGZvciAoIGxldCBpID0gMCwgbCA9IHNoYXBlcy5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRcdFx0XHRjb25zdCBzaGFwZSA9IHNoYXBlc1sgaSBdO1xuXG5cdFx0XHRcdFx0XHRzZXJpYWxpemUoIG1ldGEuc2hhcGVzLCBzaGFwZSApO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRzZXJpYWxpemUoIG1ldGEuc2hhcGVzLCBzaGFwZXMgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGlmICggdGhpcy5pc1NraW5uZWRNZXNoICkge1xuXG5cdFx0XHRvYmplY3QuYmluZE1vZGUgPSB0aGlzLmJpbmRNb2RlO1xuXHRcdFx0b2JqZWN0LmJpbmRNYXRyaXggPSB0aGlzLmJpbmRNYXRyaXgudG9BcnJheSgpO1xuXG5cdFx0XHRpZiAoIHRoaXMuc2tlbGV0b24gIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRzZXJpYWxpemUoIG1ldGEuc2tlbGV0b25zLCB0aGlzLnNrZWxldG9uICk7XG5cblx0XHRcdFx0b2JqZWN0LnNrZWxldG9uID0gdGhpcy5za2VsZXRvbi51dWlkO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAoIHRoaXMubWF0ZXJpYWwgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0aWYgKCBBcnJheS5pc0FycmF5KCB0aGlzLm1hdGVyaWFsICkgKSB7XG5cblx0XHRcdFx0Y29uc3QgdXVpZHMgPSBbXTtcblxuXHRcdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGwgPSB0aGlzLm1hdGVyaWFsLmxlbmd0aDsgaSA8IGw7IGkgKysgKSB7XG5cblx0XHRcdFx0XHR1dWlkcy5wdXNoKCBzZXJpYWxpemUoIG1ldGEubWF0ZXJpYWxzLCB0aGlzLm1hdGVyaWFsWyBpIF0gKSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRvYmplY3QubWF0ZXJpYWwgPSB1dWlkcztcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRvYmplY3QubWF0ZXJpYWwgPSBzZXJpYWxpemUoIG1ldGEubWF0ZXJpYWxzLCB0aGlzLm1hdGVyaWFsICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdC8vXG5cblx0XHRpZiAoIHRoaXMuY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcblxuXHRcdFx0b2JqZWN0LmNoaWxkcmVuID0gW107XG5cblx0XHRcdGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpICsrICkge1xuXG5cdFx0XHRcdG9iamVjdC5jaGlsZHJlbi5wdXNoKCB0aGlzLmNoaWxkcmVuWyBpIF0udG9KU09OKCBtZXRhICkub2JqZWN0ICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdC8vXG5cblx0XHRpZiAoIHRoaXMuYW5pbWF0aW9ucy5sZW5ndGggPiAwICkge1xuXG5cdFx0XHRvYmplY3QuYW5pbWF0aW9ucyA9IFtdO1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmFuaW1hdGlvbnMubGVuZ3RoOyBpICsrICkge1xuXG5cdFx0XHRcdGNvbnN0IGFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9uc1sgaSBdO1xuXG5cdFx0XHRcdG9iamVjdC5hbmltYXRpb25zLnB1c2goIHNlcmlhbGl6ZSggbWV0YS5hbmltYXRpb25zLCBhbmltYXRpb24gKSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAoIGlzUm9vdE9iamVjdCApIHtcblxuXHRcdFx0Y29uc3QgZ2VvbWV0cmllcyA9IGV4dHJhY3RGcm9tQ2FjaGUoIG1ldGEuZ2VvbWV0cmllcyApO1xuXHRcdFx0Y29uc3QgbWF0ZXJpYWxzID0gZXh0cmFjdEZyb21DYWNoZSggbWV0YS5tYXRlcmlhbHMgKTtcblx0XHRcdGNvbnN0IHRleHR1cmVzID0gZXh0cmFjdEZyb21DYWNoZSggbWV0YS50ZXh0dXJlcyApO1xuXHRcdFx0Y29uc3QgaW1hZ2VzID0gZXh0cmFjdEZyb21DYWNoZSggbWV0YS5pbWFnZXMgKTtcblx0XHRcdGNvbnN0IHNoYXBlcyA9IGV4dHJhY3RGcm9tQ2FjaGUoIG1ldGEuc2hhcGVzICk7XG5cdFx0XHRjb25zdCBza2VsZXRvbnMgPSBleHRyYWN0RnJvbUNhY2hlKCBtZXRhLnNrZWxldG9ucyApO1xuXHRcdFx0Y29uc3QgYW5pbWF0aW9ucyA9IGV4dHJhY3RGcm9tQ2FjaGUoIG1ldGEuYW5pbWF0aW9ucyApO1xuXHRcdFx0Y29uc3Qgbm9kZXMgPSBleHRyYWN0RnJvbUNhY2hlKCBtZXRhLm5vZGVzICk7XG5cblx0XHRcdGlmICggZ2VvbWV0cmllcy5sZW5ndGggPiAwICkgb3V0cHV0Lmdlb21ldHJpZXMgPSBnZW9tZXRyaWVzO1xuXHRcdFx0aWYgKCBtYXRlcmlhbHMubGVuZ3RoID4gMCApIG91dHB1dC5tYXRlcmlhbHMgPSBtYXRlcmlhbHM7XG5cdFx0XHRpZiAoIHRleHR1cmVzLmxlbmd0aCA+IDAgKSBvdXRwdXQudGV4dHVyZXMgPSB0ZXh0dXJlcztcblx0XHRcdGlmICggaW1hZ2VzLmxlbmd0aCA+IDAgKSBvdXRwdXQuaW1hZ2VzID0gaW1hZ2VzO1xuXHRcdFx0aWYgKCBzaGFwZXMubGVuZ3RoID4gMCApIG91dHB1dC5zaGFwZXMgPSBzaGFwZXM7XG5cdFx0XHRpZiAoIHNrZWxldG9ucy5sZW5ndGggPiAwICkgb3V0cHV0LnNrZWxldG9ucyA9IHNrZWxldG9ucztcblx0XHRcdGlmICggYW5pbWF0aW9ucy5sZW5ndGggPiAwICkgb3V0cHV0LmFuaW1hdGlvbnMgPSBhbmltYXRpb25zO1xuXHRcdFx0aWYgKCBub2Rlcy5sZW5ndGggPiAwICkgb3V0cHV0Lm5vZGVzID0gbm9kZXM7XG5cblx0XHR9XG5cblx0XHRvdXRwdXQub2JqZWN0ID0gb2JqZWN0O1xuXG5cdFx0cmV0dXJuIG91dHB1dDtcblxuXHRcdC8vIGV4dHJhY3QgZGF0YSBmcm9tIHRoZSBjYWNoZSBoYXNoXG5cdFx0Ly8gcmVtb3ZlIG1ldGFkYXRhIG9uIGVhY2ggaXRlbVxuXHRcdC8vIGFuZCByZXR1cm4gYXMgYXJyYXlcblx0XHRmdW5jdGlvbiBleHRyYWN0RnJvbUNhY2hlKCBjYWNoZSApIHtcblxuXHRcdFx0Y29uc3QgdmFsdWVzID0gW107XG5cdFx0XHRmb3IgKCBjb25zdCBrZXkgaW4gY2FjaGUgKSB7XG5cblx0XHRcdFx0Y29uc3QgZGF0YSA9IGNhY2hlWyBrZXkgXTtcblx0XHRcdFx0ZGVsZXRlIGRhdGEubWV0YWRhdGE7XG5cdFx0XHRcdHZhbHVlcy5wdXNoKCBkYXRhICk7XG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHZhbHVlcztcblxuXHRcdH1cblxuXHR9XG5cblx0Y2xvbmUoIHJlY3Vyc2l2ZSApIHtcblxuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvcigpLmNvcHkoIHRoaXMsIHJlY3Vyc2l2ZSApO1xuXG5cdH1cblxuXHRjb3B5KCBzb3VyY2UsIHJlY3Vyc2l2ZSA9IHRydWUgKSB7XG5cblx0XHR0aGlzLm5hbWUgPSBzb3VyY2UubmFtZTtcblxuXHRcdHRoaXMudXAuY29weSggc291cmNlLnVwICk7XG5cblx0XHR0aGlzLnBvc2l0aW9uLmNvcHkoIHNvdXJjZS5wb3NpdGlvbiApO1xuXHRcdHRoaXMucm90YXRpb24ub3JkZXIgPSBzb3VyY2Uucm90YXRpb24ub3JkZXI7XG5cdFx0dGhpcy5xdWF0ZXJuaW9uLmNvcHkoIHNvdXJjZS5xdWF0ZXJuaW9uICk7XG5cdFx0dGhpcy5zY2FsZS5jb3B5KCBzb3VyY2Uuc2NhbGUgKTtcblxuXHRcdHRoaXMubWF0cml4LmNvcHkoIHNvdXJjZS5tYXRyaXggKTtcblx0XHR0aGlzLm1hdHJpeFdvcmxkLmNvcHkoIHNvdXJjZS5tYXRyaXhXb3JsZCApO1xuXG5cdFx0dGhpcy5tYXRyaXhBdXRvVXBkYXRlID0gc291cmNlLm1hdHJpeEF1dG9VcGRhdGU7XG5cdFx0dGhpcy5tYXRyaXhXb3JsZE5lZWRzVXBkYXRlID0gc291cmNlLm1hdHJpeFdvcmxkTmVlZHNVcGRhdGU7XG5cblx0XHR0aGlzLm1hdHJpeFdvcmxkQXV0b1VwZGF0ZSA9IHNvdXJjZS5tYXRyaXhXb3JsZEF1dG9VcGRhdGU7XG5cblx0XHR0aGlzLmxheWVycy5tYXNrID0gc291cmNlLmxheWVycy5tYXNrO1xuXHRcdHRoaXMudmlzaWJsZSA9IHNvdXJjZS52aXNpYmxlO1xuXG5cdFx0dGhpcy5jYXN0U2hhZG93ID0gc291cmNlLmNhc3RTaGFkb3c7XG5cdFx0dGhpcy5yZWNlaXZlU2hhZG93ID0gc291cmNlLnJlY2VpdmVTaGFkb3c7XG5cblx0XHR0aGlzLmZydXN0dW1DdWxsZWQgPSBzb3VyY2UuZnJ1c3R1bUN1bGxlZDtcblx0XHR0aGlzLnJlbmRlck9yZGVyID0gc291cmNlLnJlbmRlck9yZGVyO1xuXG5cdFx0dGhpcy5hbmltYXRpb25zID0gc291cmNlLmFuaW1hdGlvbnM7XG5cblx0XHR0aGlzLnVzZXJEYXRhID0gSlNPTi5wYXJzZSggSlNPTi5zdHJpbmdpZnkoIHNvdXJjZS51c2VyRGF0YSApICk7XG5cblx0XHRpZiAoIHJlY3Vyc2l2ZSA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgc291cmNlLmNoaWxkcmVuLmxlbmd0aDsgaSArKyApIHtcblxuXHRcdFx0XHRjb25zdCBjaGlsZCA9IHNvdXJjZS5jaGlsZHJlblsgaSBdO1xuXHRcdFx0XHR0aGlzLmFkZCggY2hpbGQuY2xvbmUoKSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cbn1cblxuT2JqZWN0M0QuREVGQVVMVF9VUCA9IC8qQF9fUFVSRV9fKi8gbmV3IFZlY3RvcjMoIDAsIDEsIDAgKTtcbk9iamVjdDNELkRFRkFVTFRfTUFUUklYX0FVVE9fVVBEQVRFID0gdHJ1ZTtcbk9iamVjdDNELkRFRkFVTFRfTUFUUklYX1dPUkxEX0FVVE9fVVBEQVRFID0gdHJ1ZTtcblxuZXhwb3J0IHsgT2JqZWN0M0QgfTtcbiIsImZ1bmN0aW9uIGFycmF5TWluKCBhcnJheSApIHtcblxuXHRpZiAoIGFycmF5Lmxlbmd0aCA9PT0gMCApIHJldHVybiBJbmZpbml0eTtcblxuXHRsZXQgbWluID0gYXJyYXlbIDAgXTtcblxuXHRmb3IgKCBsZXQgaSA9IDEsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyArKyBpICkge1xuXG5cdFx0aWYgKCBhcnJheVsgaSBdIDwgbWluICkgbWluID0gYXJyYXlbIGkgXTtcblxuXHR9XG5cblx0cmV0dXJuIG1pbjtcblxufVxuXG5mdW5jdGlvbiBhcnJheU1heCggYXJyYXkgKSB7XG5cblx0aWYgKCBhcnJheS5sZW5ndGggPT09IDAgKSByZXR1cm4gLSBJbmZpbml0eTtcblxuXHRsZXQgbWF4ID0gYXJyYXlbIDAgXTtcblxuXHRmb3IgKCBsZXQgaSA9IDEsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyArKyBpICkge1xuXG5cdFx0aWYgKCBhcnJheVsgaSBdID4gbWF4ICkgbWF4ID0gYXJyYXlbIGkgXTtcblxuXHR9XG5cblx0cmV0dXJuIG1heDtcblxufVxuXG5mdW5jdGlvbiBhcnJheU5lZWRzVWludDMyKCBhcnJheSApIHtcblxuXHQvLyBhc3N1bWVzIGxhcmdlciB2YWx1ZXMgdXN1YWxseSBvbiBsYXN0XG5cblx0Zm9yICggbGV0IGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID49IDA7IC0tIGkgKSB7XG5cblx0XHRpZiAoIGFycmF5WyBpIF0gPj0gNjU1MzUgKSByZXR1cm4gdHJ1ZTsgLy8gYWNjb3VudCBmb3IgUFJJTUlUSVZFX1JFU1RBUlRfRklYRURfSU5ERVgsICMyNDU2NVxuXG5cdH1cblxuXHRyZXR1cm4gZmFsc2U7XG5cbn1cblxuY29uc3QgVFlQRURfQVJSQVlTID0ge1xuXHRJbnQ4QXJyYXk6IEludDhBcnJheSxcblx0VWludDhBcnJheTogVWludDhBcnJheSxcblx0VWludDhDbGFtcGVkQXJyYXk6IFVpbnQ4Q2xhbXBlZEFycmF5LFxuXHRJbnQxNkFycmF5OiBJbnQxNkFycmF5LFxuXHRVaW50MTZBcnJheTogVWludDE2QXJyYXksXG5cdEludDMyQXJyYXk6IEludDMyQXJyYXksXG5cdFVpbnQzMkFycmF5OiBVaW50MzJBcnJheSxcblx0RmxvYXQzMkFycmF5OiBGbG9hdDMyQXJyYXksXG5cdEZsb2F0NjRBcnJheTogRmxvYXQ2NEFycmF5XG59O1xuXG5mdW5jdGlvbiBnZXRUeXBlZEFycmF5KCB0eXBlLCBidWZmZXIgKSB7XG5cblx0cmV0dXJuIG5ldyBUWVBFRF9BUlJBWVNbIHR5cGUgXSggYnVmZmVyICk7XG5cbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKCBuYW1lICkge1xuXG5cdHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgbmFtZSApO1xuXG59XG5cbmNvbnN0IF9jYWNoZSA9IHt9O1xuXG5mdW5jdGlvbiB3YXJuT25jZSggbWVzc2FnZSApIHtcblxuXHRpZiAoIG1lc3NhZ2UgaW4gX2NhY2hlICkgcmV0dXJuO1xuXG5cdF9jYWNoZVsgbWVzc2FnZSBdID0gdHJ1ZTtcblxuXHRjb25zb2xlLndhcm4oIG1lc3NhZ2UgKTtcblxufVxuXG5leHBvcnQgeyBhcnJheU1pbiwgYXJyYXlNYXgsIGFycmF5TmVlZHNVaW50MzIsIGdldFR5cGVkQXJyYXksIGNyZWF0ZUVsZW1lbnROUywgd2Fybk9uY2UgfTtcbiIsImltcG9ydCB7IFZlY3RvcjMgfSBmcm9tICcuLi9tYXRoL1ZlY3RvcjMuanMnO1xuaW1wb3J0IHsgVmVjdG9yMiB9IGZyb20gJy4uL21hdGgvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBCb3gzIH0gZnJvbSAnLi4vbWF0aC9Cb3gzLmpzJztcbmltcG9ydCB7IEV2ZW50RGlzcGF0Y2hlciB9IGZyb20gJy4vRXZlbnREaXNwYXRjaGVyLmpzJztcbmltcG9ydCB7IEJ1ZmZlckF0dHJpYnV0ZSwgRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSwgVWludDE2QnVmZmVyQXR0cmlidXRlLCBVaW50MzJCdWZmZXJBdHRyaWJ1dGUgfSBmcm9tICcuL0J1ZmZlckF0dHJpYnV0ZS5qcyc7XG5pbXBvcnQgeyBTcGhlcmUgfSBmcm9tICcuLi9tYXRoL1NwaGVyZS5qcyc7XG5pbXBvcnQgeyBPYmplY3QzRCB9IGZyb20gJy4vT2JqZWN0M0QuanMnO1xuaW1wb3J0IHsgTWF0cml4NCB9IGZyb20gJy4uL21hdGgvTWF0cml4NC5qcyc7XG5pbXBvcnQgeyBNYXRyaXgzIH0gZnJvbSAnLi4vbWF0aC9NYXRyaXgzLmpzJztcbmltcG9ydCAqIGFzIE1hdGhVdGlscyBmcm9tICcuLi9tYXRoL01hdGhVdGlscy5qcyc7XG5pbXBvcnQgeyBhcnJheU5lZWRzVWludDMyIH0gZnJvbSAnLi4vdXRpbHMuanMnO1xuXG5sZXQgX2lkID0gMDtcblxuY29uc3QgX20xID0gLypAX19QVVJFX18qLyBuZXcgTWF0cml4NCgpO1xuY29uc3QgX29iaiA9IC8qQF9fUFVSRV9fKi8gbmV3IE9iamVjdDNEKCk7XG5jb25zdCBfb2Zmc2V0ID0gLypAX19QVVJFX18qLyBuZXcgVmVjdG9yMygpO1xuY29uc3QgX2JveCA9IC8qQF9fUFVSRV9fKi8gbmV3IEJveDMoKTtcbmNvbnN0IF9ib3hNb3JwaFRhcmdldHMgPSAvKkBfX1BVUkVfXyovIG5ldyBCb3gzKCk7XG5jb25zdCBfdmVjdG9yID0gLypAX19QVVJFX18qLyBuZXcgVmVjdG9yMygpO1xuXG5jbGFzcyBCdWZmZXJHZW9tZXRyeSBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlciB7XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5pc0J1ZmZlckdlb21ldHJ5ID0gdHJ1ZTtcblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ2lkJywgeyB2YWx1ZTogX2lkICsrIH0gKTtcblxuXHRcdHRoaXMudXVpZCA9IE1hdGhVdGlscy5nZW5lcmF0ZVVVSUQoKTtcblxuXHRcdHRoaXMubmFtZSA9ICcnO1xuXHRcdHRoaXMudHlwZSA9ICdCdWZmZXJHZW9tZXRyeSc7XG5cblx0XHR0aGlzLmluZGV4ID0gbnVsbDtcblx0XHR0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcblxuXHRcdHRoaXMubW9ycGhBdHRyaWJ1dGVzID0ge307XG5cdFx0dGhpcy5tb3JwaFRhcmdldHNSZWxhdGl2ZSA9IGZhbHNlO1xuXG5cdFx0dGhpcy5ncm91cHMgPSBbXTtcblxuXHRcdHRoaXMuYm91bmRpbmdCb3ggPSBudWxsO1xuXHRcdHRoaXMuYm91bmRpbmdTcGhlcmUgPSBudWxsO1xuXG5cdFx0dGhpcy5kcmF3UmFuZ2UgPSB7IHN0YXJ0OiAwLCBjb3VudDogSW5maW5pdHkgfTtcblxuXHRcdHRoaXMudXNlckRhdGEgPSB7fTtcblxuXHR9XG5cblx0Z2V0SW5kZXgoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5pbmRleDtcblxuXHR9XG5cblx0c2V0SW5kZXgoIGluZGV4ICkge1xuXG5cdFx0aWYgKCBBcnJheS5pc0FycmF5KCBpbmRleCApICkge1xuXG5cdFx0XHR0aGlzLmluZGV4ID0gbmV3ICggYXJyYXlOZWVkc1VpbnQzMiggaW5kZXggKSA/IFVpbnQzMkJ1ZmZlckF0dHJpYnV0ZSA6IFVpbnQxNkJ1ZmZlckF0dHJpYnV0ZSApKCBpbmRleCwgMSApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dGhpcy5pbmRleCA9IGluZGV4O1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGdldEF0dHJpYnV0ZSggbmFtZSApIHtcblxuXHRcdHJldHVybiB0aGlzLmF0dHJpYnV0ZXNbIG5hbWUgXTtcblxuXHR9XG5cblx0c2V0QXR0cmlidXRlKCBuYW1lLCBhdHRyaWJ1dGUgKSB7XG5cblx0XHR0aGlzLmF0dHJpYnV0ZXNbIG5hbWUgXSA9IGF0dHJpYnV0ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRkZWxldGVBdHRyaWJ1dGUoIG5hbWUgKSB7XG5cblx0XHRkZWxldGUgdGhpcy5hdHRyaWJ1dGVzWyBuYW1lIF07XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0aGFzQXR0cmlidXRlKCBuYW1lICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuYXR0cmlidXRlc1sgbmFtZSBdICE9PSB1bmRlZmluZWQ7XG5cblx0fVxuXG5cdGFkZEdyb3VwKCBzdGFydCwgY291bnQsIG1hdGVyaWFsSW5kZXggPSAwICkge1xuXG5cdFx0dGhpcy5ncm91cHMucHVzaCgge1xuXG5cdFx0XHRzdGFydDogc3RhcnQsXG5cdFx0XHRjb3VudDogY291bnQsXG5cdFx0XHRtYXRlcmlhbEluZGV4OiBtYXRlcmlhbEluZGV4XG5cblx0XHR9ICk7XG5cblx0fVxuXG5cdGNsZWFyR3JvdXBzKCkge1xuXG5cdFx0dGhpcy5ncm91cHMgPSBbXTtcblxuXHR9XG5cblx0c2V0RHJhd1JhbmdlKCBzdGFydCwgY291bnQgKSB7XG5cblx0XHR0aGlzLmRyYXdSYW5nZS5zdGFydCA9IHN0YXJ0O1xuXHRcdHRoaXMuZHJhd1JhbmdlLmNvdW50ID0gY291bnQ7XG5cblx0fVxuXG5cdGFwcGx5TWF0cml4NCggbWF0cml4ICkge1xuXG5cdFx0Y29uc3QgcG9zaXRpb24gPSB0aGlzLmF0dHJpYnV0ZXMucG9zaXRpb247XG5cblx0XHRpZiAoIHBvc2l0aW9uICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHBvc2l0aW9uLmFwcGx5TWF0cml4NCggbWF0cml4ICk7XG5cblx0XHRcdHBvc2l0aW9uLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IG5vcm1hbCA9IHRoaXMuYXR0cmlidXRlcy5ub3JtYWw7XG5cblx0XHRpZiAoIG5vcm1hbCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRjb25zdCBub3JtYWxNYXRyaXggPSBuZXcgTWF0cml4MygpLmdldE5vcm1hbE1hdHJpeCggbWF0cml4ICk7XG5cblx0XHRcdG5vcm1hbC5hcHBseU5vcm1hbE1hdHJpeCggbm9ybWFsTWF0cml4ICk7XG5cblx0XHRcdG5vcm1hbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cblx0XHR9XG5cblx0XHRjb25zdCB0YW5nZW50ID0gdGhpcy5hdHRyaWJ1dGVzLnRhbmdlbnQ7XG5cblx0XHRpZiAoIHRhbmdlbnQgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0dGFuZ2VudC50cmFuc2Zvcm1EaXJlY3Rpb24oIG1hdHJpeCApO1xuXG5cdFx0XHR0YW5nZW50Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuXHRcdH1cblxuXHRcdGlmICggdGhpcy5ib3VuZGluZ0JveCAhPT0gbnVsbCApIHtcblxuXHRcdFx0dGhpcy5jb21wdXRlQm91bmRpbmdCb3goKTtcblxuXHRcdH1cblxuXHRcdGlmICggdGhpcy5ib3VuZGluZ1NwaGVyZSAhPT0gbnVsbCApIHtcblxuXHRcdFx0dGhpcy5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhcHBseVF1YXRlcm5pb24oIHEgKSB7XG5cblx0XHRfbTEubWFrZVJvdGF0aW9uRnJvbVF1YXRlcm5pb24oIHEgKTtcblxuXHRcdHRoaXMuYXBwbHlNYXRyaXg0KCBfbTEgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRyb3RhdGVYKCBhbmdsZSApIHtcblxuXHRcdC8vIHJvdGF0ZSBnZW9tZXRyeSBhcm91bmQgd29ybGQgeC1heGlzXG5cblx0XHRfbTEubWFrZVJvdGF0aW9uWCggYW5nbGUgKTtcblxuXHRcdHRoaXMuYXBwbHlNYXRyaXg0KCBfbTEgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRyb3RhdGVZKCBhbmdsZSApIHtcblxuXHRcdC8vIHJvdGF0ZSBnZW9tZXRyeSBhcm91bmQgd29ybGQgeS1heGlzXG5cblx0XHRfbTEubWFrZVJvdGF0aW9uWSggYW5nbGUgKTtcblxuXHRcdHRoaXMuYXBwbHlNYXRyaXg0KCBfbTEgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRyb3RhdGVaKCBhbmdsZSApIHtcblxuXHRcdC8vIHJvdGF0ZSBnZW9tZXRyeSBhcm91bmQgd29ybGQgei1heGlzXG5cblx0XHRfbTEubWFrZVJvdGF0aW9uWiggYW5nbGUgKTtcblxuXHRcdHRoaXMuYXBwbHlNYXRyaXg0KCBfbTEgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR0cmFuc2xhdGUoIHgsIHksIHogKSB7XG5cblx0XHQvLyB0cmFuc2xhdGUgZ2VvbWV0cnlcblxuXHRcdF9tMS5tYWtlVHJhbnNsYXRpb24oIHgsIHksIHogKTtcblxuXHRcdHRoaXMuYXBwbHlNYXRyaXg0KCBfbTEgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzY2FsZSggeCwgeSwgeiApIHtcblxuXHRcdC8vIHNjYWxlIGdlb21ldHJ5XG5cblx0XHRfbTEubWFrZVNjYWxlKCB4LCB5LCB6ICk7XG5cblx0XHR0aGlzLmFwcGx5TWF0cml4NCggX20xICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bG9va0F0KCB2ZWN0b3IgKSB7XG5cblx0XHRfb2JqLmxvb2tBdCggdmVjdG9yICk7XG5cblx0XHRfb2JqLnVwZGF0ZU1hdHJpeCgpO1xuXG5cdFx0dGhpcy5hcHBseU1hdHJpeDQoIF9vYmoubWF0cml4ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y2VudGVyKCkge1xuXG5cdFx0dGhpcy5jb21wdXRlQm91bmRpbmdCb3goKTtcblxuXHRcdHRoaXMuYm91bmRpbmdCb3guZ2V0Q2VudGVyKCBfb2Zmc2V0ICkubmVnYXRlKCk7XG5cblx0XHR0aGlzLnRyYW5zbGF0ZSggX29mZnNldC54LCBfb2Zmc2V0LnksIF9vZmZzZXQueiApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21Qb2ludHMoIHBvaW50cyApIHtcblxuXHRcdGNvbnN0IHBvc2l0aW9uID0gW107XG5cblx0XHRmb3IgKCBsZXQgaSA9IDAsIGwgPSBwb2ludHMubGVuZ3RoOyBpIDwgbDsgaSArKyApIHtcblxuXHRcdFx0Y29uc3QgcG9pbnQgPSBwb2ludHNbIGkgXTtcblx0XHRcdHBvc2l0aW9uLnB1c2goIHBvaW50LngsIHBvaW50LnksIHBvaW50LnogfHwgMCApO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRBdHRyaWJ1dGUoICdwb3NpdGlvbicsIG5ldyBGbG9hdDMyQnVmZmVyQXR0cmlidXRlKCBwb3NpdGlvbiwgMyApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y29tcHV0ZUJvdW5kaW5nQm94KCkge1xuXG5cdFx0aWYgKCB0aGlzLmJvdW5kaW5nQm94ID09PSBudWxsICkge1xuXG5cdFx0XHR0aGlzLmJvdW5kaW5nQm94ID0gbmV3IEJveDMoKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IHBvc2l0aW9uID0gdGhpcy5hdHRyaWJ1dGVzLnBvc2l0aW9uO1xuXHRcdGNvbnN0IG1vcnBoQXR0cmlidXRlc1Bvc2l0aW9uID0gdGhpcy5tb3JwaEF0dHJpYnV0ZXMucG9zaXRpb247XG5cblx0XHRpZiAoIHBvc2l0aW9uICYmIHBvc2l0aW9uLmlzR0xCdWZmZXJBdHRyaWJ1dGUgKSB7XG5cblx0XHRcdGNvbnNvbGUuZXJyb3IoICdUSFJFRS5CdWZmZXJHZW9tZXRyeS5jb21wdXRlQm91bmRpbmdCb3goKTogR0xCdWZmZXJBdHRyaWJ1dGUgcmVxdWlyZXMgYSBtYW51YWwgYm91bmRpbmcgYm94LiBBbHRlcm5hdGl2ZWx5IHNldCBcIm1lc2guZnJ1c3R1bUN1bGxlZFwiIHRvIFwiZmFsc2VcIi4nLCB0aGlzICk7XG5cblx0XHRcdHRoaXMuYm91bmRpbmdCb3guc2V0KFxuXHRcdFx0XHRuZXcgVmVjdG9yMyggLSBJbmZpbml0eSwgLSBJbmZpbml0eSwgLSBJbmZpbml0eSApLFxuXHRcdFx0XHRuZXcgVmVjdG9yMyggKyBJbmZpbml0eSwgKyBJbmZpbml0eSwgKyBJbmZpbml0eSApXG5cdFx0XHQpO1xuXG5cdFx0XHRyZXR1cm47XG5cblx0XHR9XG5cblx0XHRpZiAoIHBvc2l0aW9uICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHRoaXMuYm91bmRpbmdCb3guc2V0RnJvbUJ1ZmZlckF0dHJpYnV0ZSggcG9zaXRpb24gKTtcblxuXHRcdFx0Ly8gcHJvY2VzcyBtb3JwaCBhdHRyaWJ1dGVzIGlmIHByZXNlbnRcblxuXHRcdFx0aWYgKCBtb3JwaEF0dHJpYnV0ZXNQb3NpdGlvbiApIHtcblxuXHRcdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gbW9ycGhBdHRyaWJ1dGVzUG9zaXRpb24ubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdFx0XHRjb25zdCBtb3JwaEF0dHJpYnV0ZSA9IG1vcnBoQXR0cmlidXRlc1Bvc2l0aW9uWyBpIF07XG5cdFx0XHRcdFx0X2JveC5zZXRGcm9tQnVmZmVyQXR0cmlidXRlKCBtb3JwaEF0dHJpYnV0ZSApO1xuXG5cdFx0XHRcdFx0aWYgKCB0aGlzLm1vcnBoVGFyZ2V0c1JlbGF0aXZlICkge1xuXG5cdFx0XHRcdFx0XHRfdmVjdG9yLmFkZFZlY3RvcnMoIHRoaXMuYm91bmRpbmdCb3gubWluLCBfYm94Lm1pbiApO1xuXHRcdFx0XHRcdFx0dGhpcy5ib3VuZGluZ0JveC5leHBhbmRCeVBvaW50KCBfdmVjdG9yICk7XG5cblx0XHRcdFx0XHRcdF92ZWN0b3IuYWRkVmVjdG9ycyggdGhpcy5ib3VuZGluZ0JveC5tYXgsIF9ib3gubWF4ICk7XG5cdFx0XHRcdFx0XHR0aGlzLmJvdW5kaW5nQm94LmV4cGFuZEJ5UG9pbnQoIF92ZWN0b3IgKTtcblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdHRoaXMuYm91bmRpbmdCb3guZXhwYW5kQnlQb2ludCggX2JveC5taW4gKTtcblx0XHRcdFx0XHRcdHRoaXMuYm91bmRpbmdCb3guZXhwYW5kQnlQb2ludCggX2JveC5tYXggKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHRoaXMuYm91bmRpbmdCb3gubWFrZUVtcHR5KCk7XG5cblx0XHR9XG5cblx0XHRpZiAoIGlzTmFOKCB0aGlzLmJvdW5kaW5nQm94Lm1pbi54ICkgfHwgaXNOYU4oIHRoaXMuYm91bmRpbmdCb3gubWluLnkgKSB8fCBpc05hTiggdGhpcy5ib3VuZGluZ0JveC5taW4ueiApICkge1xuXG5cdFx0XHRjb25zb2xlLmVycm9yKCAnVEhSRUUuQnVmZmVyR2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nQm94KCk6IENvbXB1dGVkIG1pbi9tYXggaGF2ZSBOYU4gdmFsdWVzLiBUaGUgXCJwb3NpdGlvblwiIGF0dHJpYnV0ZSBpcyBsaWtlbHkgdG8gaGF2ZSBOYU4gdmFsdWVzLicsIHRoaXMgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0Y29tcHV0ZUJvdW5kaW5nU3BoZXJlKCkge1xuXG5cdFx0aWYgKCB0aGlzLmJvdW5kaW5nU3BoZXJlID09PSBudWxsICkge1xuXG5cdFx0XHR0aGlzLmJvdW5kaW5nU3BoZXJlID0gbmV3IFNwaGVyZSgpO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgcG9zaXRpb24gPSB0aGlzLmF0dHJpYnV0ZXMucG9zaXRpb247XG5cdFx0Y29uc3QgbW9ycGhBdHRyaWJ1dGVzUG9zaXRpb24gPSB0aGlzLm1vcnBoQXR0cmlidXRlcy5wb3NpdGlvbjtcblxuXHRcdGlmICggcG9zaXRpb24gJiYgcG9zaXRpb24uaXNHTEJ1ZmZlckF0dHJpYnV0ZSApIHtcblxuXHRcdFx0Y29uc29sZS5lcnJvciggJ1RIUkVFLkJ1ZmZlckdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ1NwaGVyZSgpOiBHTEJ1ZmZlckF0dHJpYnV0ZSByZXF1aXJlcyBhIG1hbnVhbCBib3VuZGluZyBzcGhlcmUuIEFsdGVybmF0aXZlbHkgc2V0IFwibWVzaC5mcnVzdHVtQ3VsbGVkXCIgdG8gXCJmYWxzZVwiLicsIHRoaXMgKTtcblxuXHRcdFx0dGhpcy5ib3VuZGluZ1NwaGVyZS5zZXQoIG5ldyBWZWN0b3IzKCksIEluZmluaXR5ICk7XG5cblx0XHRcdHJldHVybjtcblxuXHRcdH1cblxuXHRcdGlmICggcG9zaXRpb24gKSB7XG5cblx0XHRcdC8vIGZpcnN0LCBmaW5kIHRoZSBjZW50ZXIgb2YgdGhlIGJvdW5kaW5nIHNwaGVyZVxuXG5cdFx0XHRjb25zdCBjZW50ZXIgPSB0aGlzLmJvdW5kaW5nU3BoZXJlLmNlbnRlcjtcblxuXHRcdFx0X2JveC5zZXRGcm9tQnVmZmVyQXR0cmlidXRlKCBwb3NpdGlvbiApO1xuXG5cdFx0XHQvLyBwcm9jZXNzIG1vcnBoIGF0dHJpYnV0ZXMgaWYgcHJlc2VudFxuXG5cdFx0XHRpZiAoIG1vcnBoQXR0cmlidXRlc1Bvc2l0aW9uICkge1xuXG5cdFx0XHRcdGZvciAoIGxldCBpID0gMCwgaWwgPSBtb3JwaEF0dHJpYnV0ZXNQb3NpdGlvbi5sZW5ndGg7IGkgPCBpbDsgaSArKyApIHtcblxuXHRcdFx0XHRcdGNvbnN0IG1vcnBoQXR0cmlidXRlID0gbW9ycGhBdHRyaWJ1dGVzUG9zaXRpb25bIGkgXTtcblx0XHRcdFx0XHRfYm94TW9ycGhUYXJnZXRzLnNldEZyb21CdWZmZXJBdHRyaWJ1dGUoIG1vcnBoQXR0cmlidXRlICk7XG5cblx0XHRcdFx0XHRpZiAoIHRoaXMubW9ycGhUYXJnZXRzUmVsYXRpdmUgKSB7XG5cblx0XHRcdFx0XHRcdF92ZWN0b3IuYWRkVmVjdG9ycyggX2JveC5taW4sIF9ib3hNb3JwaFRhcmdldHMubWluICk7XG5cdFx0XHRcdFx0XHRfYm94LmV4cGFuZEJ5UG9pbnQoIF92ZWN0b3IgKTtcblxuXHRcdFx0XHRcdFx0X3ZlY3Rvci5hZGRWZWN0b3JzKCBfYm94Lm1heCwgX2JveE1vcnBoVGFyZ2V0cy5tYXggKTtcblx0XHRcdFx0XHRcdF9ib3guZXhwYW5kQnlQb2ludCggX3ZlY3RvciApO1xuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0X2JveC5leHBhbmRCeVBvaW50KCBfYm94TW9ycGhUYXJnZXRzLm1pbiApO1xuXHRcdFx0XHRcdFx0X2JveC5leHBhbmRCeVBvaW50KCBfYm94TW9ycGhUYXJnZXRzLm1heCApO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHRfYm94LmdldENlbnRlciggY2VudGVyICk7XG5cblx0XHRcdC8vIHNlY29uZCwgdHJ5IHRvIGZpbmQgYSBib3VuZGluZ1NwaGVyZSB3aXRoIGEgcmFkaXVzIHNtYWxsZXIgdGhhbiB0aGVcblx0XHRcdC8vIGJvdW5kaW5nU3BoZXJlIG9mIHRoZSBib3VuZGluZ0JveDogc3FydCgzKSBzbWFsbGVyIGluIHRoZSBiZXN0IGNhc2VcblxuXHRcdFx0bGV0IG1heFJhZGl1c1NxID0gMDtcblxuXHRcdFx0Zm9yICggbGV0IGkgPSAwLCBpbCA9IHBvc2l0aW9uLmNvdW50OyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdFx0X3ZlY3Rvci5mcm9tQnVmZmVyQXR0cmlidXRlKCBwb3NpdGlvbiwgaSApO1xuXG5cdFx0XHRcdG1heFJhZGl1c1NxID0gTWF0aC5tYXgoIG1heFJhZGl1c1NxLCBjZW50ZXIuZGlzdGFuY2VUb1NxdWFyZWQoIF92ZWN0b3IgKSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdC8vIHByb2Nlc3MgbW9ycGggYXR0cmlidXRlcyBpZiBwcmVzZW50XG5cblx0XHRcdGlmICggbW9ycGhBdHRyaWJ1dGVzUG9zaXRpb24gKSB7XG5cblx0XHRcdFx0Zm9yICggbGV0IGkgPSAwLCBpbCA9IG1vcnBoQXR0cmlidXRlc1Bvc2l0aW9uLmxlbmd0aDsgaSA8IGlsOyBpICsrICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgbW9ycGhBdHRyaWJ1dGUgPSBtb3JwaEF0dHJpYnV0ZXNQb3NpdGlvblsgaSBdO1xuXHRcdFx0XHRcdGNvbnN0IG1vcnBoVGFyZ2V0c1JlbGF0aXZlID0gdGhpcy5tb3JwaFRhcmdldHNSZWxhdGl2ZTtcblxuXHRcdFx0XHRcdGZvciAoIGxldCBqID0gMCwgamwgPSBtb3JwaEF0dHJpYnV0ZS5jb3VudDsgaiA8IGpsOyBqICsrICkge1xuXG5cdFx0XHRcdFx0XHRfdmVjdG9yLmZyb21CdWZmZXJBdHRyaWJ1dGUoIG1vcnBoQXR0cmlidXRlLCBqICk7XG5cblx0XHRcdFx0XHRcdGlmICggbW9ycGhUYXJnZXRzUmVsYXRpdmUgKSB7XG5cblx0XHRcdFx0XHRcdFx0X29mZnNldC5mcm9tQnVmZmVyQXR0cmlidXRlKCBwb3NpdGlvbiwgaiApO1xuXHRcdFx0XHRcdFx0XHRfdmVjdG9yLmFkZCggX29mZnNldCApO1xuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdG1heFJhZGl1c1NxID0gTWF0aC5tYXgoIG1heFJhZGl1c1NxLCBjZW50ZXIuZGlzdGFuY2VUb1NxdWFyZWQoIF92ZWN0b3IgKSApO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmJvdW5kaW5nU3BoZXJlLnJhZGl1cyA9IE1hdGguc3FydCggbWF4UmFkaXVzU3EgKTtcblxuXHRcdFx0aWYgKCBpc05hTiggdGhpcy5ib3VuZGluZ1NwaGVyZS5yYWRpdXMgKSApIHtcblxuXHRcdFx0XHRjb25zb2xlLmVycm9yKCAnVEhSRUUuQnVmZmVyR2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk6IENvbXB1dGVkIHJhZGl1cyBpcyBOYU4uIFRoZSBcInBvc2l0aW9uXCIgYXR0cmlidXRlIGlzIGxpa2VseSB0byBoYXZlIE5hTiB2YWx1ZXMuJywgdGhpcyApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG5cdGNvbXB1dGVUYW5nZW50cygpIHtcblxuXHRcdGNvbnN0IGluZGV4ID0gdGhpcy5pbmRleDtcblx0XHRjb25zdCBhdHRyaWJ1dGVzID0gdGhpcy5hdHRyaWJ1dGVzO1xuXG5cdFx0Ly8gYmFzZWQgb24gaHR0cDovL3d3dy50ZXJhdGhvbi5jb20vY29kZS90YW5nZW50Lmh0bWxcblx0XHQvLyAocGVyIHZlcnRleCB0YW5nZW50cylcblxuXHRcdGlmICggaW5kZXggPT09IG51bGwgfHxcblx0XHRcdCBhdHRyaWJ1dGVzLnBvc2l0aW9uID09PSB1bmRlZmluZWQgfHxcblx0XHRcdCBhdHRyaWJ1dGVzLm5vcm1hbCA9PT0gdW5kZWZpbmVkIHx8XG5cdFx0XHQgYXR0cmlidXRlcy51diA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRjb25zb2xlLmVycm9yKCAnVEhSRUUuQnVmZmVyR2VvbWV0cnk6IC5jb21wdXRlVGFuZ2VudHMoKSBmYWlsZWQuIE1pc3NpbmcgcmVxdWlyZWQgYXR0cmlidXRlcyAoaW5kZXgsIHBvc2l0aW9uLCBub3JtYWwgb3IgdXYpJyApO1xuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgaW5kaWNlcyA9IGluZGV4LmFycmF5O1xuXHRcdGNvbnN0IHBvc2l0aW9ucyA9IGF0dHJpYnV0ZXMucG9zaXRpb24uYXJyYXk7XG5cdFx0Y29uc3Qgbm9ybWFscyA9IGF0dHJpYnV0ZXMubm9ybWFsLmFycmF5O1xuXHRcdGNvbnN0IHV2cyA9IGF0dHJpYnV0ZXMudXYuYXJyYXk7XG5cblx0XHRjb25zdCBuVmVydGljZXMgPSBwb3NpdGlvbnMubGVuZ3RoIC8gMztcblxuXHRcdGlmICggdGhpcy5oYXNBdHRyaWJ1dGUoICd0YW5nZW50JyApID09PSBmYWxzZSApIHtcblxuXHRcdFx0dGhpcy5zZXRBdHRyaWJ1dGUoICd0YW5nZW50JywgbmV3IEJ1ZmZlckF0dHJpYnV0ZSggbmV3IEZsb2F0MzJBcnJheSggNCAqIG5WZXJ0aWNlcyApLCA0ICkgKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IHRhbmdlbnRzID0gdGhpcy5nZXRBdHRyaWJ1dGUoICd0YW5nZW50JyApLmFycmF5O1xuXG5cdFx0Y29uc3QgdGFuMSA9IFtdLCB0YW4yID0gW107XG5cblx0XHRmb3IgKCBsZXQgaSA9IDA7IGkgPCBuVmVydGljZXM7IGkgKysgKSB7XG5cblx0XHRcdHRhbjFbIGkgXSA9IG5ldyBWZWN0b3IzKCk7XG5cdFx0XHR0YW4yWyBpIF0gPSBuZXcgVmVjdG9yMygpO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgdkEgPSBuZXcgVmVjdG9yMygpLFxuXHRcdFx0dkIgPSBuZXcgVmVjdG9yMygpLFxuXHRcdFx0dkMgPSBuZXcgVmVjdG9yMygpLFxuXG5cdFx0XHR1dkEgPSBuZXcgVmVjdG9yMigpLFxuXHRcdFx0dXZCID0gbmV3IFZlY3RvcjIoKSxcblx0XHRcdHV2QyA9IG5ldyBWZWN0b3IyKCksXG5cblx0XHRcdHNkaXIgPSBuZXcgVmVjdG9yMygpLFxuXHRcdFx0dGRpciA9IG5ldyBWZWN0b3IzKCk7XG5cblx0XHRmdW5jdGlvbiBoYW5kbGVUcmlhbmdsZSggYSwgYiwgYyApIHtcblxuXHRcdFx0dkEuZnJvbUFycmF5KCBwb3NpdGlvbnMsIGEgKiAzICk7XG5cdFx0XHR2Qi5mcm9tQXJyYXkoIHBvc2l0aW9ucywgYiAqIDMgKTtcblx0XHRcdHZDLmZyb21BcnJheSggcG9zaXRpb25zLCBjICogMyApO1xuXG5cdFx0XHR1dkEuZnJvbUFycmF5KCB1dnMsIGEgKiAyICk7XG5cdFx0XHR1dkIuZnJvbUFycmF5KCB1dnMsIGIgKiAyICk7XG5cdFx0XHR1dkMuZnJvbUFycmF5KCB1dnMsIGMgKiAyICk7XG5cblx0XHRcdHZCLnN1YiggdkEgKTtcblx0XHRcdHZDLnN1YiggdkEgKTtcblxuXHRcdFx0dXZCLnN1YiggdXZBICk7XG5cdFx0XHR1dkMuc3ViKCB1dkEgKTtcblxuXHRcdFx0Y29uc3QgciA9IDEuMCAvICggdXZCLnggKiB1dkMueSAtIHV2Qy54ICogdXZCLnkgKTtcblxuXHRcdFx0Ly8gc2lsZW50bHkgaWdub3JlIGRlZ2VuZXJhdGUgdXYgdHJpYW5nbGVzIGhhdmluZyBjb2luY2lkZW50IG9yIGNvbGluZWFyIHZlcnRpY2VzXG5cblx0XHRcdGlmICggISBpc0Zpbml0ZSggciApICkgcmV0dXJuO1xuXG5cdFx0XHRzZGlyLmNvcHkoIHZCICkubXVsdGlwbHlTY2FsYXIoIHV2Qy55ICkuYWRkU2NhbGVkVmVjdG9yKCB2QywgLSB1dkIueSApLm11bHRpcGx5U2NhbGFyKCByICk7XG5cdFx0XHR0ZGlyLmNvcHkoIHZDICkubXVsdGlwbHlTY2FsYXIoIHV2Qi54ICkuYWRkU2NhbGVkVmVjdG9yKCB2QiwgLSB1dkMueCApLm11bHRpcGx5U2NhbGFyKCByICk7XG5cblx0XHRcdHRhbjFbIGEgXS5hZGQoIHNkaXIgKTtcblx0XHRcdHRhbjFbIGIgXS5hZGQoIHNkaXIgKTtcblx0XHRcdHRhbjFbIGMgXS5hZGQoIHNkaXIgKTtcblxuXHRcdFx0dGFuMlsgYSBdLmFkZCggdGRpciApO1xuXHRcdFx0dGFuMlsgYiBdLmFkZCggdGRpciApO1xuXHRcdFx0dGFuMlsgYyBdLmFkZCggdGRpciApO1xuXG5cdFx0fVxuXG5cdFx0bGV0IGdyb3VwcyA9IHRoaXMuZ3JvdXBzO1xuXG5cdFx0aWYgKCBncm91cHMubGVuZ3RoID09PSAwICkge1xuXG5cdFx0XHRncm91cHMgPSBbIHtcblx0XHRcdFx0c3RhcnQ6IDAsXG5cdFx0XHRcdGNvdW50OiBpbmRpY2VzLmxlbmd0aFxuXHRcdFx0fSBdO1xuXG5cdFx0fVxuXG5cdFx0Zm9yICggbGV0IGkgPSAwLCBpbCA9IGdyb3Vwcy5sZW5ndGg7IGkgPCBpbDsgKysgaSApIHtcblxuXHRcdFx0Y29uc3QgZ3JvdXAgPSBncm91cHNbIGkgXTtcblxuXHRcdFx0Y29uc3Qgc3RhcnQgPSBncm91cC5zdGFydDtcblx0XHRcdGNvbnN0IGNvdW50ID0gZ3JvdXAuY291bnQ7XG5cblx0XHRcdGZvciAoIGxldCBqID0gc3RhcnQsIGpsID0gc3RhcnQgKyBjb3VudDsgaiA8IGpsOyBqICs9IDMgKSB7XG5cblx0XHRcdFx0aGFuZGxlVHJpYW5nbGUoXG5cdFx0XHRcdFx0aW5kaWNlc1sgaiArIDAgXSxcblx0XHRcdFx0XHRpbmRpY2VzWyBqICsgMSBdLFxuXHRcdFx0XHRcdGluZGljZXNbIGogKyAyIF1cblx0XHRcdFx0KTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0Y29uc3QgdG1wID0gbmV3IFZlY3RvcjMoKSwgdG1wMiA9IG5ldyBWZWN0b3IzKCk7XG5cdFx0Y29uc3QgbiA9IG5ldyBWZWN0b3IzKCksIG4yID0gbmV3IFZlY3RvcjMoKTtcblxuXHRcdGZ1bmN0aW9uIGhhbmRsZVZlcnRleCggdiApIHtcblxuXHRcdFx0bi5mcm9tQXJyYXkoIG5vcm1hbHMsIHYgKiAzICk7XG5cdFx0XHRuMi5jb3B5KCBuICk7XG5cblx0XHRcdGNvbnN0IHQgPSB0YW4xWyB2IF07XG5cblx0XHRcdC8vIEdyYW0tU2NobWlkdCBvcnRob2dvbmFsaXplXG5cblx0XHRcdHRtcC5jb3B5KCB0ICk7XG5cdFx0XHR0bXAuc3ViKCBuLm11bHRpcGx5U2NhbGFyKCBuLmRvdCggdCApICkgKS5ub3JtYWxpemUoKTtcblxuXHRcdFx0Ly8gQ2FsY3VsYXRlIGhhbmRlZG5lc3NcblxuXHRcdFx0dG1wMi5jcm9zc1ZlY3RvcnMoIG4yLCB0ICk7XG5cdFx0XHRjb25zdCB0ZXN0ID0gdG1wMi5kb3QoIHRhbjJbIHYgXSApO1xuXHRcdFx0Y29uc3QgdyA9ICggdGVzdCA8IDAuMCApID8gLSAxLjAgOiAxLjA7XG5cblx0XHRcdHRhbmdlbnRzWyB2ICogNCBdID0gdG1wLng7XG5cdFx0XHR0YW5nZW50c1sgdiAqIDQgKyAxIF0gPSB0bXAueTtcblx0XHRcdHRhbmdlbnRzWyB2ICogNCArIDIgXSA9IHRtcC56O1xuXHRcdFx0dGFuZ2VudHNbIHYgKiA0ICsgMyBdID0gdztcblxuXHRcdH1cblxuXHRcdGZvciAoIGxldCBpID0gMCwgaWwgPSBncm91cHMubGVuZ3RoOyBpIDwgaWw7ICsrIGkgKSB7XG5cblx0XHRcdGNvbnN0IGdyb3VwID0gZ3JvdXBzWyBpIF07XG5cblx0XHRcdGNvbnN0IHN0YXJ0ID0gZ3JvdXAuc3RhcnQ7XG5cdFx0XHRjb25zdCBjb3VudCA9IGdyb3VwLmNvdW50O1xuXG5cdFx0XHRmb3IgKCBsZXQgaiA9IHN0YXJ0LCBqbCA9IHN0YXJ0ICsgY291bnQ7IGogPCBqbDsgaiArPSAzICkge1xuXG5cdFx0XHRcdGhhbmRsZVZlcnRleCggaW5kaWNlc1sgaiArIDAgXSApO1xuXHRcdFx0XHRoYW5kbGVWZXJ0ZXgoIGluZGljZXNbIGogKyAxIF0gKTtcblx0XHRcdFx0aGFuZGxlVmVydGV4KCBpbmRpY2VzWyBqICsgMiBdICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cblx0Y29tcHV0ZVZlcnRleE5vcm1hbHMoKSB7XG5cblx0XHRjb25zdCBpbmRleCA9IHRoaXMuaW5kZXg7XG5cdFx0Y29uc3QgcG9zaXRpb25BdHRyaWJ1dGUgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ3Bvc2l0aW9uJyApO1xuXG5cdFx0aWYgKCBwb3NpdGlvbkF0dHJpYnV0ZSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRsZXQgbm9ybWFsQXR0cmlidXRlID0gdGhpcy5nZXRBdHRyaWJ1dGUoICdub3JtYWwnICk7XG5cblx0XHRcdGlmICggbm9ybWFsQXR0cmlidXRlID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0bm9ybWFsQXR0cmlidXRlID0gbmV3IEJ1ZmZlckF0dHJpYnV0ZSggbmV3IEZsb2F0MzJBcnJheSggcG9zaXRpb25BdHRyaWJ1dGUuY291bnQgKiAzICksIDMgKTtcblx0XHRcdFx0dGhpcy5zZXRBdHRyaWJ1dGUoICdub3JtYWwnLCBub3JtYWxBdHRyaWJ1dGUgKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyByZXNldCBleGlzdGluZyBub3JtYWxzIHRvIHplcm9cblxuXHRcdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gbm9ybWFsQXR0cmlidXRlLmNvdW50OyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdFx0XHRub3JtYWxBdHRyaWJ1dGUuc2V0WFlaKCBpLCAwLCAwLCAwICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHBBID0gbmV3IFZlY3RvcjMoKSwgcEIgPSBuZXcgVmVjdG9yMygpLCBwQyA9IG5ldyBWZWN0b3IzKCk7XG5cdFx0XHRjb25zdCBuQSA9IG5ldyBWZWN0b3IzKCksIG5CID0gbmV3IFZlY3RvcjMoKSwgbkMgPSBuZXcgVmVjdG9yMygpO1xuXHRcdFx0Y29uc3QgY2IgPSBuZXcgVmVjdG9yMygpLCBhYiA9IG5ldyBWZWN0b3IzKCk7XG5cblx0XHRcdC8vIGluZGV4ZWQgZWxlbWVudHNcblxuXHRcdFx0aWYgKCBpbmRleCApIHtcblxuXHRcdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gaW5kZXguY291bnQ7IGkgPCBpbDsgaSArPSAzICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgdkEgPSBpbmRleC5nZXRYKCBpICsgMCApO1xuXHRcdFx0XHRcdGNvbnN0IHZCID0gaW5kZXguZ2V0WCggaSArIDEgKTtcblx0XHRcdFx0XHRjb25zdCB2QyA9IGluZGV4LmdldFgoIGkgKyAyICk7XG5cblx0XHRcdFx0XHRwQS5mcm9tQnVmZmVyQXR0cmlidXRlKCBwb3NpdGlvbkF0dHJpYnV0ZSwgdkEgKTtcblx0XHRcdFx0XHRwQi5mcm9tQnVmZmVyQXR0cmlidXRlKCBwb3NpdGlvbkF0dHJpYnV0ZSwgdkIgKTtcblx0XHRcdFx0XHRwQy5mcm9tQnVmZmVyQXR0cmlidXRlKCBwb3NpdGlvbkF0dHJpYnV0ZSwgdkMgKTtcblxuXHRcdFx0XHRcdGNiLnN1YlZlY3RvcnMoIHBDLCBwQiApO1xuXHRcdFx0XHRcdGFiLnN1YlZlY3RvcnMoIHBBLCBwQiApO1xuXHRcdFx0XHRcdGNiLmNyb3NzKCBhYiApO1xuXG5cdFx0XHRcdFx0bkEuZnJvbUJ1ZmZlckF0dHJpYnV0ZSggbm9ybWFsQXR0cmlidXRlLCB2QSApO1xuXHRcdFx0XHRcdG5CLmZyb21CdWZmZXJBdHRyaWJ1dGUoIG5vcm1hbEF0dHJpYnV0ZSwgdkIgKTtcblx0XHRcdFx0XHRuQy5mcm9tQnVmZmVyQXR0cmlidXRlKCBub3JtYWxBdHRyaWJ1dGUsIHZDICk7XG5cblx0XHRcdFx0XHRuQS5hZGQoIGNiICk7XG5cdFx0XHRcdFx0bkIuYWRkKCBjYiApO1xuXHRcdFx0XHRcdG5DLmFkZCggY2IgKTtcblxuXHRcdFx0XHRcdG5vcm1hbEF0dHJpYnV0ZS5zZXRYWVooIHZBLCBuQS54LCBuQS55LCBuQS56ICk7XG5cdFx0XHRcdFx0bm9ybWFsQXR0cmlidXRlLnNldFhZWiggdkIsIG5CLngsIG5CLnksIG5CLnogKTtcblx0XHRcdFx0XHRub3JtYWxBdHRyaWJ1dGUuc2V0WFlaKCB2QywgbkMueCwgbkMueSwgbkMueiApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyBub24taW5kZXhlZCBlbGVtZW50cyAodW5jb25uZWN0ZWQgdHJpYW5nbGUgc291cClcblxuXHRcdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gcG9zaXRpb25BdHRyaWJ1dGUuY291bnQ7IGkgPCBpbDsgaSArPSAzICkge1xuXG5cdFx0XHRcdFx0cEEuZnJvbUJ1ZmZlckF0dHJpYnV0ZSggcG9zaXRpb25BdHRyaWJ1dGUsIGkgKyAwICk7XG5cdFx0XHRcdFx0cEIuZnJvbUJ1ZmZlckF0dHJpYnV0ZSggcG9zaXRpb25BdHRyaWJ1dGUsIGkgKyAxICk7XG5cdFx0XHRcdFx0cEMuZnJvbUJ1ZmZlckF0dHJpYnV0ZSggcG9zaXRpb25BdHRyaWJ1dGUsIGkgKyAyICk7XG5cblx0XHRcdFx0XHRjYi5zdWJWZWN0b3JzKCBwQywgcEIgKTtcblx0XHRcdFx0XHRhYi5zdWJWZWN0b3JzKCBwQSwgcEIgKTtcblx0XHRcdFx0XHRjYi5jcm9zcyggYWIgKTtcblxuXHRcdFx0XHRcdG5vcm1hbEF0dHJpYnV0ZS5zZXRYWVooIGkgKyAwLCBjYi54LCBjYi55LCBjYi56ICk7XG5cdFx0XHRcdFx0bm9ybWFsQXR0cmlidXRlLnNldFhZWiggaSArIDEsIGNiLngsIGNiLnksIGNiLnogKTtcblx0XHRcdFx0XHRub3JtYWxBdHRyaWJ1dGUuc2V0WFlaKCBpICsgMiwgY2IueCwgY2IueSwgY2IueiApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm5vcm1hbGl6ZU5vcm1hbHMoKTtcblxuXHRcdFx0bm9ybWFsQXR0cmlidXRlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuXHRcdH1cblxuXHR9XG5cblx0bm9ybWFsaXplTm9ybWFscygpIHtcblxuXHRcdGNvbnN0IG5vcm1hbHMgPSB0aGlzLmF0dHJpYnV0ZXMubm9ybWFsO1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwLCBpbCA9IG5vcm1hbHMuY291bnQ7IGkgPCBpbDsgaSArKyApIHtcblxuXHRcdFx0X3ZlY3Rvci5mcm9tQnVmZmVyQXR0cmlidXRlKCBub3JtYWxzLCBpICk7XG5cblx0XHRcdF92ZWN0b3Iubm9ybWFsaXplKCk7XG5cblx0XHRcdG5vcm1hbHMuc2V0WFlaKCBpLCBfdmVjdG9yLngsIF92ZWN0b3IueSwgX3ZlY3Rvci56ICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdHRvTm9uSW5kZXhlZCgpIHtcblxuXHRcdGZ1bmN0aW9uIGNvbnZlcnRCdWZmZXJBdHRyaWJ1dGUoIGF0dHJpYnV0ZSwgaW5kaWNlcyApIHtcblxuXHRcdFx0Y29uc3QgYXJyYXkgPSBhdHRyaWJ1dGUuYXJyYXk7XG5cdFx0XHRjb25zdCBpdGVtU2l6ZSA9IGF0dHJpYnV0ZS5pdGVtU2l6ZTtcblx0XHRcdGNvbnN0IG5vcm1hbGl6ZWQgPSBhdHRyaWJ1dGUubm9ybWFsaXplZDtcblxuXHRcdFx0Y29uc3QgYXJyYXkyID0gbmV3IGFycmF5LmNvbnN0cnVjdG9yKCBpbmRpY2VzLmxlbmd0aCAqIGl0ZW1TaXplICk7XG5cblx0XHRcdGxldCBpbmRleCA9IDAsIGluZGV4MiA9IDA7XG5cblx0XHRcdGZvciAoIGxldCBpID0gMCwgbCA9IGluZGljZXMubGVuZ3RoOyBpIDwgbDsgaSArKyApIHtcblxuXHRcdFx0XHRpZiAoIGF0dHJpYnV0ZS5pc0ludGVybGVhdmVkQnVmZmVyQXR0cmlidXRlICkge1xuXG5cdFx0XHRcdFx0aW5kZXggPSBpbmRpY2VzWyBpIF0gKiBhdHRyaWJ1dGUuZGF0YS5zdHJpZGUgKyBhdHRyaWJ1dGUub2Zmc2V0O1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRpbmRleCA9IGluZGljZXNbIGkgXSAqIGl0ZW1TaXplO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmb3IgKCBsZXQgaiA9IDA7IGogPCBpdGVtU2l6ZTsgaiArKyApIHtcblxuXHRcdFx0XHRcdGFycmF5MlsgaW5kZXgyICsrIF0gPSBhcnJheVsgaW5kZXggKysgXTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG5ldyBCdWZmZXJBdHRyaWJ1dGUoIGFycmF5MiwgaXRlbVNpemUsIG5vcm1hbGl6ZWQgKTtcblxuXHRcdH1cblxuXHRcdC8vXG5cblx0XHRpZiAoIHRoaXMuaW5kZXggPT09IG51bGwgKSB7XG5cblx0XHRcdGNvbnNvbGUud2FybiggJ1RIUkVFLkJ1ZmZlckdlb21ldHJ5LnRvTm9uSW5kZXhlZCgpOiBCdWZmZXJHZW9tZXRyeSBpcyBhbHJlYWR5IG5vbi1pbmRleGVkLicgKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgZ2VvbWV0cnkyID0gbmV3IEJ1ZmZlckdlb21ldHJ5KCk7XG5cblx0XHRjb25zdCBpbmRpY2VzID0gdGhpcy5pbmRleC5hcnJheTtcblx0XHRjb25zdCBhdHRyaWJ1dGVzID0gdGhpcy5hdHRyaWJ1dGVzO1xuXG5cdFx0Ly8gYXR0cmlidXRlc1xuXG5cdFx0Zm9yICggY29uc3QgbmFtZSBpbiBhdHRyaWJ1dGVzICkge1xuXG5cdFx0XHRjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzWyBuYW1lIF07XG5cblx0XHRcdGNvbnN0IG5ld0F0dHJpYnV0ZSA9IGNvbnZlcnRCdWZmZXJBdHRyaWJ1dGUoIGF0dHJpYnV0ZSwgaW5kaWNlcyApO1xuXG5cdFx0XHRnZW9tZXRyeTIuc2V0QXR0cmlidXRlKCBuYW1lLCBuZXdBdHRyaWJ1dGUgKTtcblxuXHRcdH1cblxuXHRcdC8vIG1vcnBoIGF0dHJpYnV0ZXNcblxuXHRcdGNvbnN0IG1vcnBoQXR0cmlidXRlcyA9IHRoaXMubW9ycGhBdHRyaWJ1dGVzO1xuXG5cdFx0Zm9yICggY29uc3QgbmFtZSBpbiBtb3JwaEF0dHJpYnV0ZXMgKSB7XG5cblx0XHRcdGNvbnN0IG1vcnBoQXJyYXkgPSBbXTtcblx0XHRcdGNvbnN0IG1vcnBoQXR0cmlidXRlID0gbW9ycGhBdHRyaWJ1dGVzWyBuYW1lIF07IC8vIG1vcnBoQXR0cmlidXRlOiBhcnJheSBvZiBGbG9hdDMyQnVmZmVyQXR0cmlidXRlc1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gbW9ycGhBdHRyaWJ1dGUubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdFx0Y29uc3QgYXR0cmlidXRlID0gbW9ycGhBdHRyaWJ1dGVbIGkgXTtcblxuXHRcdFx0XHRjb25zdCBuZXdBdHRyaWJ1dGUgPSBjb252ZXJ0QnVmZmVyQXR0cmlidXRlKCBhdHRyaWJ1dGUsIGluZGljZXMgKTtcblxuXHRcdFx0XHRtb3JwaEFycmF5LnB1c2goIG5ld0F0dHJpYnV0ZSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGdlb21ldHJ5Mi5tb3JwaEF0dHJpYnV0ZXNbIG5hbWUgXSA9IG1vcnBoQXJyYXk7XG5cblx0XHR9XG5cblx0XHRnZW9tZXRyeTIubW9ycGhUYXJnZXRzUmVsYXRpdmUgPSB0aGlzLm1vcnBoVGFyZ2V0c1JlbGF0aXZlO1xuXG5cdFx0Ly8gZ3JvdXBzXG5cblx0XHRjb25zdCBncm91cHMgPSB0aGlzLmdyb3VwcztcblxuXHRcdGZvciAoIGxldCBpID0gMCwgbCA9IGdyb3Vwcy5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRjb25zdCBncm91cCA9IGdyb3Vwc1sgaSBdO1xuXHRcdFx0Z2VvbWV0cnkyLmFkZEdyb3VwKCBncm91cC5zdGFydCwgZ3JvdXAuY291bnQsIGdyb3VwLm1hdGVyaWFsSW5kZXggKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiBnZW9tZXRyeTI7XG5cblx0fVxuXG5cdHRvSlNPTigpIHtcblxuXHRcdGNvbnN0IGRhdGEgPSB7XG5cdFx0XHRtZXRhZGF0YToge1xuXHRcdFx0XHR2ZXJzaW9uOiA0LjYsXG5cdFx0XHRcdHR5cGU6ICdCdWZmZXJHZW9tZXRyeScsXG5cdFx0XHRcdGdlbmVyYXRvcjogJ0J1ZmZlckdlb21ldHJ5LnRvSlNPTidcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly8gc3RhbmRhcmQgQnVmZmVyR2VvbWV0cnkgc2VyaWFsaXphdGlvblxuXG5cdFx0ZGF0YS51dWlkID0gdGhpcy51dWlkO1xuXHRcdGRhdGEudHlwZSA9IHRoaXMudHlwZTtcblx0XHRpZiAoIHRoaXMubmFtZSAhPT0gJycgKSBkYXRhLm5hbWUgPSB0aGlzLm5hbWU7XG5cdFx0aWYgKCBPYmplY3Qua2V5cyggdGhpcy51c2VyRGF0YSApLmxlbmd0aCA+IDAgKSBkYXRhLnVzZXJEYXRhID0gdGhpcy51c2VyRGF0YTtcblxuXHRcdGlmICggdGhpcy5wYXJhbWV0ZXJzICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGNvbnN0IHBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlcnM7XG5cblx0XHRcdGZvciAoIGNvbnN0IGtleSBpbiBwYXJhbWV0ZXJzICkge1xuXG5cdFx0XHRcdGlmICggcGFyYW1ldGVyc1sga2V5IF0gIT09IHVuZGVmaW5lZCApIGRhdGFbIGtleSBdID0gcGFyYW1ldGVyc1sga2V5IF07XG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGRhdGE7XG5cblx0XHR9XG5cblx0XHQvLyBmb3Igc2ltcGxpY2l0eSB0aGUgY29kZSBhc3N1bWVzIGF0dHJpYnV0ZXMgYXJlIG5vdCBzaGFyZWQgYWNyb3NzIGdlb21ldHJpZXMsIHNlZSAjMTU4MTFcblxuXHRcdGRhdGEuZGF0YSA9IHsgYXR0cmlidXRlczoge30gfTtcblxuXHRcdGNvbnN0IGluZGV4ID0gdGhpcy5pbmRleDtcblxuXHRcdGlmICggaW5kZXggIT09IG51bGwgKSB7XG5cblx0XHRcdGRhdGEuZGF0YS5pbmRleCA9IHtcblx0XHRcdFx0dHlwZTogaW5kZXguYXJyYXkuY29uc3RydWN0b3IubmFtZSxcblx0XHRcdFx0YXJyYXk6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBpbmRleC5hcnJheSApXG5cdFx0XHR9O1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgYXR0cmlidXRlcyA9IHRoaXMuYXR0cmlidXRlcztcblxuXHRcdGZvciAoIGNvbnN0IGtleSBpbiBhdHRyaWJ1dGVzICkge1xuXG5cdFx0XHRjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzWyBrZXkgXTtcblxuXHRcdFx0ZGF0YS5kYXRhLmF0dHJpYnV0ZXNbIGtleSBdID0gYXR0cmlidXRlLnRvSlNPTiggZGF0YS5kYXRhICk7XG5cblx0XHR9XG5cblx0XHRjb25zdCBtb3JwaEF0dHJpYnV0ZXMgPSB7fTtcblx0XHRsZXQgaGFzTW9ycGhBdHRyaWJ1dGVzID0gZmFsc2U7XG5cblx0XHRmb3IgKCBjb25zdCBrZXkgaW4gdGhpcy5tb3JwaEF0dHJpYnV0ZXMgKSB7XG5cblx0XHRcdGNvbnN0IGF0dHJpYnV0ZUFycmF5ID0gdGhpcy5tb3JwaEF0dHJpYnV0ZXNbIGtleSBdO1xuXG5cdFx0XHRjb25zdCBhcnJheSA9IFtdO1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gYXR0cmlidXRlQXJyYXkubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdFx0Y29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlQXJyYXlbIGkgXTtcblxuXHRcdFx0XHRhcnJheS5wdXNoKCBhdHRyaWJ1dGUudG9KU09OKCBkYXRhLmRhdGEgKSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggYXJyYXkubGVuZ3RoID4gMCApIHtcblxuXHRcdFx0XHRtb3JwaEF0dHJpYnV0ZXNbIGtleSBdID0gYXJyYXk7XG5cblx0XHRcdFx0aGFzTW9ycGhBdHRyaWJ1dGVzID0gdHJ1ZTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0aWYgKCBoYXNNb3JwaEF0dHJpYnV0ZXMgKSB7XG5cblx0XHRcdGRhdGEuZGF0YS5tb3JwaEF0dHJpYnV0ZXMgPSBtb3JwaEF0dHJpYnV0ZXM7XG5cdFx0XHRkYXRhLmRhdGEubW9ycGhUYXJnZXRzUmVsYXRpdmUgPSB0aGlzLm1vcnBoVGFyZ2V0c1JlbGF0aXZlO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgZ3JvdXBzID0gdGhpcy5ncm91cHM7XG5cblx0XHRpZiAoIGdyb3Vwcy5sZW5ndGggPiAwICkge1xuXG5cdFx0XHRkYXRhLmRhdGEuZ3JvdXBzID0gSlNPTi5wYXJzZSggSlNPTi5zdHJpbmdpZnkoIGdyb3VwcyApICk7XG5cblx0XHR9XG5cblx0XHRjb25zdCBib3VuZGluZ1NwaGVyZSA9IHRoaXMuYm91bmRpbmdTcGhlcmU7XG5cblx0XHRpZiAoIGJvdW5kaW5nU3BoZXJlICE9PSBudWxsICkge1xuXG5cdFx0XHRkYXRhLmRhdGEuYm91bmRpbmdTcGhlcmUgPSB7XG5cdFx0XHRcdGNlbnRlcjogYm91bmRpbmdTcGhlcmUuY2VudGVyLnRvQXJyYXkoKSxcblx0XHRcdFx0cmFkaXVzOiBib3VuZGluZ1NwaGVyZS5yYWRpdXNcblx0XHRcdH07XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gZGF0YTtcblxuXHR9XG5cblx0Y2xvbmUoKSB7XG5cblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoKS5jb3B5KCB0aGlzICk7XG5cblx0fVxuXG5cdGNvcHkoIHNvdXJjZSApIHtcblxuXHRcdC8vIHJlc2V0XG5cblx0XHR0aGlzLmluZGV4ID0gbnVsbDtcblx0XHR0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcblx0XHR0aGlzLm1vcnBoQXR0cmlidXRlcyA9IHt9O1xuXHRcdHRoaXMuZ3JvdXBzID0gW107XG5cdFx0dGhpcy5ib3VuZGluZ0JveCA9IG51bGw7XG5cdFx0dGhpcy5ib3VuZGluZ1NwaGVyZSA9IG51bGw7XG5cblx0XHQvLyB1c2VkIGZvciBzdG9yaW5nIGNsb25lZCwgc2hhcmVkIGRhdGFcblxuXHRcdGNvbnN0IGRhdGEgPSB7fTtcblxuXHRcdC8vIG5hbWVcblxuXHRcdHRoaXMubmFtZSA9IHNvdXJjZS5uYW1lO1xuXG5cdFx0Ly8gaW5kZXhcblxuXHRcdGNvbnN0IGluZGV4ID0gc291cmNlLmluZGV4O1xuXG5cdFx0aWYgKCBpbmRleCAhPT0gbnVsbCApIHtcblxuXHRcdFx0dGhpcy5zZXRJbmRleCggaW5kZXguY2xvbmUoIGRhdGEgKSApO1xuXG5cdFx0fVxuXG5cdFx0Ly8gYXR0cmlidXRlc1xuXG5cdFx0Y29uc3QgYXR0cmlidXRlcyA9IHNvdXJjZS5hdHRyaWJ1dGVzO1xuXG5cdFx0Zm9yICggY29uc3QgbmFtZSBpbiBhdHRyaWJ1dGVzICkge1xuXG5cdFx0XHRjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzWyBuYW1lIF07XG5cdFx0XHR0aGlzLnNldEF0dHJpYnV0ZSggbmFtZSwgYXR0cmlidXRlLmNsb25lKCBkYXRhICkgKTtcblxuXHRcdH1cblxuXHRcdC8vIG1vcnBoIGF0dHJpYnV0ZXNcblxuXHRcdGNvbnN0IG1vcnBoQXR0cmlidXRlcyA9IHNvdXJjZS5tb3JwaEF0dHJpYnV0ZXM7XG5cblx0XHRmb3IgKCBjb25zdCBuYW1lIGluIG1vcnBoQXR0cmlidXRlcyApIHtcblxuXHRcdFx0Y29uc3QgYXJyYXkgPSBbXTtcblx0XHRcdGNvbnN0IG1vcnBoQXR0cmlidXRlID0gbW9ycGhBdHRyaWJ1dGVzWyBuYW1lIF07IC8vIG1vcnBoQXR0cmlidXRlOiBhcnJheSBvZiBGbG9hdDMyQnVmZmVyQXR0cmlidXRlc1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGwgPSBtb3JwaEF0dHJpYnV0ZS5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRcdGFycmF5LnB1c2goIG1vcnBoQXR0cmlidXRlWyBpIF0uY2xvbmUoIGRhdGEgKSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdHRoaXMubW9ycGhBdHRyaWJ1dGVzWyBuYW1lIF0gPSBhcnJheTtcblxuXHRcdH1cblxuXHRcdHRoaXMubW9ycGhUYXJnZXRzUmVsYXRpdmUgPSBzb3VyY2UubW9ycGhUYXJnZXRzUmVsYXRpdmU7XG5cblx0XHQvLyBncm91cHNcblxuXHRcdGNvbnN0IGdyb3VwcyA9IHNvdXJjZS5ncm91cHM7XG5cblx0XHRmb3IgKCBsZXQgaSA9IDAsIGwgPSBncm91cHMubGVuZ3RoOyBpIDwgbDsgaSArKyApIHtcblxuXHRcdFx0Y29uc3QgZ3JvdXAgPSBncm91cHNbIGkgXTtcblx0XHRcdHRoaXMuYWRkR3JvdXAoIGdyb3VwLnN0YXJ0LCBncm91cC5jb3VudCwgZ3JvdXAubWF0ZXJpYWxJbmRleCApO1xuXG5cdFx0fVxuXG5cdFx0Ly8gYm91bmRpbmcgYm94XG5cblx0XHRjb25zdCBib3VuZGluZ0JveCA9IHNvdXJjZS5ib3VuZGluZ0JveDtcblxuXHRcdGlmICggYm91bmRpbmdCb3ggIT09IG51bGwgKSB7XG5cblx0XHRcdHRoaXMuYm91bmRpbmdCb3ggPSBib3VuZGluZ0JveC5jbG9uZSgpO1xuXG5cdFx0fVxuXG5cdFx0Ly8gYm91bmRpbmcgc3BoZXJlXG5cblx0XHRjb25zdCBib3VuZGluZ1NwaGVyZSA9IHNvdXJjZS5ib3VuZGluZ1NwaGVyZTtcblxuXHRcdGlmICggYm91bmRpbmdTcGhlcmUgIT09IG51bGwgKSB7XG5cblx0XHRcdHRoaXMuYm91bmRpbmdTcGhlcmUgPSBib3VuZGluZ1NwaGVyZS5jbG9uZSgpO1xuXG5cdFx0fVxuXG5cdFx0Ly8gZHJhdyByYW5nZVxuXG5cdFx0dGhpcy5kcmF3UmFuZ2Uuc3RhcnQgPSBzb3VyY2UuZHJhd1JhbmdlLnN0YXJ0O1xuXHRcdHRoaXMuZHJhd1JhbmdlLmNvdW50ID0gc291cmNlLmRyYXdSYW5nZS5jb3VudDtcblxuXHRcdC8vIHVzZXIgZGF0YVxuXG5cdFx0dGhpcy51c2VyRGF0YSA9IHNvdXJjZS51c2VyRGF0YTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KCB7IHR5cGU6ICdkaXNwb3NlJyB9ICk7XG5cblx0fVxuXG59XG5cbmV4cG9ydCB7IEJ1ZmZlckdlb21ldHJ5IH07XG4iLCJpbXBvcnQgeyBTUkdCQ29sb3JTcGFjZSwgTGluZWFyU1JHQkNvbG9yU3BhY2UsIERpc3BsYXlQM0NvbG9yU3BhY2UsIH0gZnJvbSAnLi4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IE1hdHJpeDMgfSBmcm9tICcuL01hdHJpeDMuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gU1JHQlRvTGluZWFyKCBjICkge1xuXG5cdHJldHVybiAoIGMgPCAwLjA0MDQ1ICkgPyBjICogMC4wNzczOTkzODA4IDogTWF0aC5wb3coIGMgKiAwLjk0Nzg2NzI5ODYgKyAwLjA1MjEzMjcwMTQsIDIuNCApO1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBMaW5lYXJUb1NSR0IoIGMgKSB7XG5cblx0cmV0dXJuICggYyA8IDAuMDAzMTMwOCApID8gYyAqIDEyLjkyIDogMS4wNTUgKiAoIE1hdGgucG93KCBjLCAwLjQxNjY2ICkgKSAtIDAuMDU1O1xuXG59XG5cbi8qKlxuICogTWF0cmljZXMgY29udmVydGluZyBQMyA8LT4gUmVjLiA3MDkgcHJpbWFyaWVzLCB3aXRob3V0IGdhbXV0IG1hcHBpbmdcbiAqIG9yIGNsaXBwaW5nLiBCYXNlZCBvbiBXM0Mgc3BlY2lmaWNhdGlvbnMgZm9yIHNSR0IgYW5kIERpc3BsYXkgUDMsXG4gKiBhbmQgSUNDIHNwZWNpZmljYXRpb25zIGZvciB0aGUgRDUwIGNvbm5lY3Rpb24gc3BhY2UuIFZhbHVlcyBpbi9vdXRcbiAqIGFyZSBfbGluZWFyXyBzUkdCIGFuZCBfbGluZWFyXyBEaXNwbGF5IFAzLlxuICpcbiAqIE5vdGUgdGhhdCBib3RoIHNSR0IgYW5kIERpc3BsYXkgUDMgdXNlIHRoZSBzUkdCIHRyYW5zZmVyIGZ1bmN0aW9ucy5cbiAqXG4gKiBSZWZlcmVuY2U6XG4gKiAtIGh0dHA6Ly93d3cucnVzc2VsbGNvdHRyZWxsLmNvbS9waG90by9tYXRyaXhDYWxjdWxhdG9yLmh0bVxuICovXG5cbmNvbnN0IExJTkVBUl9TUkdCX1RPX0xJTkVBUl9ESVNQTEFZX1AzID0gLypAX19QVVJFX18qLyBuZXcgTWF0cml4MygpLmZyb21BcnJheSggW1xuXHQwLjgyMjQ2MjEsIDAuMDMzMTk0MSwgMC4wMTcwODI3LFxuXHQwLjE3NzUzODAsIDAuOTY2ODA1OCwgMC4wNzIzOTc0LFxuXHQtIDAuMDAwMDAwMSwgMC4wMDAwMDAxLCAwLjkxMDUxOTlcbl0gKTtcblxuY29uc3QgTElORUFSX0RJU1BMQVlfUDNfVE9fTElORUFSX1NSR0IgPSAvKkBfX1BVUkVfXyovIG5ldyBNYXRyaXgzKCkuZnJvbUFycmF5KCBbXG5cdDEuMjI0OTQwMSwgLSAwLjA0MjA1NjksIC0gMC4wMTk2Mzc2LFxuXHQtIDAuMjI0OTQwNCwgMS4wNDIwNTcxLCAtIDAuMDc4NjM2MSxcblx0MC4wMDAwMDAxLCAwLjAwMDAwMDAsIDEuMDk4MjczNVxuXSApO1xuXG5mdW5jdGlvbiBEaXNwbGF5UDNUb0xpbmVhclNSR0IoIGNvbG9yICkge1xuXG5cdC8vIERpc3BsYXkgUDMgdXNlcyB0aGUgc1JHQiB0cmFuc2ZlciBmdW5jdGlvbnNcblx0cmV0dXJuIGNvbG9yLmNvbnZlcnRTUkdCVG9MaW5lYXIoKS5hcHBseU1hdHJpeDMoIExJTkVBUl9ESVNQTEFZX1AzX1RPX0xJTkVBUl9TUkdCICk7XG5cbn1cblxuZnVuY3Rpb24gTGluZWFyU1JHQlRvRGlzcGxheVAzKCBjb2xvciApIHtcblxuXHQvLyBEaXNwbGF5IFAzIHVzZXMgdGhlIHNSR0IgdHJhbnNmZXIgZnVuY3Rpb25zXG5cdHJldHVybiBjb2xvci5hcHBseU1hdHJpeDMoIExJTkVBUl9TUkdCX1RPX0xJTkVBUl9ESVNQTEFZX1AzICkuY29udmVydExpbmVhclRvU1JHQigpO1xuXG59XG5cbi8vIENvbnZlcnNpb25zIGZyb20gPHNvdXJjZT4gdG8gTGluZWFyLXNSR0IgcmVmZXJlbmNlIHNwYWNlLlxuY29uc3QgVE9fTElORUFSID0ge1xuXHRbIExpbmVhclNSR0JDb2xvclNwYWNlIF06ICggY29sb3IgKSA9PiBjb2xvcixcblx0WyBTUkdCQ29sb3JTcGFjZSBdOiAoIGNvbG9yICkgPT4gY29sb3IuY29udmVydFNSR0JUb0xpbmVhcigpLFxuXHRbIERpc3BsYXlQM0NvbG9yU3BhY2UgXTogRGlzcGxheVAzVG9MaW5lYXJTUkdCLFxufTtcblxuLy8gQ29udmVyc2lvbnMgdG8gPHRhcmdldD4gZnJvbSBMaW5lYXItc1JHQiByZWZlcmVuY2Ugc3BhY2UuXG5jb25zdCBGUk9NX0xJTkVBUiA9IHtcblx0WyBMaW5lYXJTUkdCQ29sb3JTcGFjZSBdOiAoIGNvbG9yICkgPT4gY29sb3IsXG5cdFsgU1JHQkNvbG9yU3BhY2UgXTogKCBjb2xvciApID0+IGNvbG9yLmNvbnZlcnRMaW5lYXJUb1NSR0IoKSxcblx0WyBEaXNwbGF5UDNDb2xvclNwYWNlIF06IExpbmVhclNSR0JUb0Rpc3BsYXlQMyxcbn07XG5cbmV4cG9ydCBjb25zdCBDb2xvck1hbmFnZW1lbnQgPSB7XG5cblx0ZW5hYmxlZDogdHJ1ZSxcblxuXHRnZXQgbGVnYWN5TW9kZSgpIHtcblxuXHRcdGNvbnNvbGUud2FybiggJ1RIUkVFLkNvbG9yTWFuYWdlbWVudDogLmxlZ2FjeU1vZGU9ZmFsc2UgcmVuYW1lZCB0byAuZW5hYmxlZD10cnVlIGluIHIxNTAuJyApO1xuXG5cdFx0cmV0dXJuICEgdGhpcy5lbmFibGVkO1xuXG5cdH0sXG5cblx0c2V0IGxlZ2FjeU1vZGUoIGxlZ2FjeU1vZGUgKSB7XG5cblx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5Db2xvck1hbmFnZW1lbnQ6IC5sZWdhY3lNb2RlPWZhbHNlIHJlbmFtZWQgdG8gLmVuYWJsZWQ9dHJ1ZSBpbiByMTUwLicgKTtcblxuXHRcdHRoaXMuZW5hYmxlZCA9ICEgbGVnYWN5TW9kZTtcblxuXHR9LFxuXG5cdGdldCB3b3JraW5nQ29sb3JTcGFjZSgpIHtcblxuXHRcdHJldHVybiBMaW5lYXJTUkdCQ29sb3JTcGFjZTtcblxuXHR9LFxuXG5cdHNldCB3b3JraW5nQ29sb3JTcGFjZSggY29sb3JTcGFjZSApIHtcblxuXHRcdGNvbnNvbGUud2FybiggJ1RIUkVFLkNvbG9yTWFuYWdlbWVudDogLndvcmtpbmdDb2xvclNwYWNlIGlzIHJlYWRvbmx5LicgKTtcblxuXHR9LFxuXG5cdGNvbnZlcnQ6IGZ1bmN0aW9uICggY29sb3IsIHNvdXJjZUNvbG9yU3BhY2UsIHRhcmdldENvbG9yU3BhY2UgKSB7XG5cblx0XHRpZiAoIHRoaXMuZW5hYmxlZCA9PT0gZmFsc2UgfHwgc291cmNlQ29sb3JTcGFjZSA9PT0gdGFyZ2V0Q29sb3JTcGFjZSB8fCAhIHNvdXJjZUNvbG9yU3BhY2UgfHwgISB0YXJnZXRDb2xvclNwYWNlICkge1xuXG5cdFx0XHRyZXR1cm4gY29sb3I7XG5cblx0XHR9XG5cblx0XHRjb25zdCBzb3VyY2VUb0xpbmVhciA9IFRPX0xJTkVBUlsgc291cmNlQ29sb3JTcGFjZSBdO1xuXHRcdGNvbnN0IHRhcmdldEZyb21MaW5lYXIgPSBGUk9NX0xJTkVBUlsgdGFyZ2V0Q29sb3JTcGFjZSBdO1xuXG5cdFx0aWYgKCBzb3VyY2VUb0xpbmVhciA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldEZyb21MaW5lYXIgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgVW5zdXBwb3J0ZWQgY29sb3Igc3BhY2UgY29udmVyc2lvbiwgXCIkeyBzb3VyY2VDb2xvclNwYWNlIH1cIiB0byBcIiR7IHRhcmdldENvbG9yU3BhY2UgfVwiLmAgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0YXJnZXRGcm9tTGluZWFyKCBzb3VyY2VUb0xpbmVhciggY29sb3IgKSApO1xuXG5cdH0sXG5cblx0ZnJvbVdvcmtpbmdDb2xvclNwYWNlOiBmdW5jdGlvbiAoIGNvbG9yLCB0YXJnZXRDb2xvclNwYWNlICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuY29udmVydCggY29sb3IsIHRoaXMud29ya2luZ0NvbG9yU3BhY2UsIHRhcmdldENvbG9yU3BhY2UgKTtcblxuXHR9LFxuXG5cdHRvV29ya2luZ0NvbG9yU3BhY2U6IGZ1bmN0aW9uICggY29sb3IsIHNvdXJjZUNvbG9yU3BhY2UgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5jb252ZXJ0KCBjb2xvciwgc291cmNlQ29sb3JTcGFjZSwgdGhpcy53b3JraW5nQ29sb3JTcGFjZSApO1xuXG5cdH0sXG5cbn07XG4iLCJpbXBvcnQgeyBjbGFtcCwgZXVjbGlkZWFuTW9kdWxvLCBsZXJwIH0gZnJvbSAnLi9NYXRoVXRpbHMuanMnO1xuaW1wb3J0IHsgQ29sb3JNYW5hZ2VtZW50LCBTUkdCVG9MaW5lYXIsIExpbmVhclRvU1JHQiB9IGZyb20gJy4vQ29sb3JNYW5hZ2VtZW50LmpzJztcbmltcG9ydCB7IFNSR0JDb2xvclNwYWNlIH0gZnJvbSAnLi4vY29uc3RhbnRzLmpzJztcblxuY29uc3QgX2NvbG9yS2V5d29yZHMgPSB7ICdhbGljZWJsdWUnOiAweEYwRjhGRiwgJ2FudGlxdWV3aGl0ZSc6IDB4RkFFQkQ3LCAnYXF1YSc6IDB4MDBGRkZGLCAnYXF1YW1hcmluZSc6IDB4N0ZGRkQ0LCAnYXp1cmUnOiAweEYwRkZGRixcblx0J2JlaWdlJzogMHhGNUY1REMsICdiaXNxdWUnOiAweEZGRTRDNCwgJ2JsYWNrJzogMHgwMDAwMDAsICdibGFuY2hlZGFsbW9uZCc6IDB4RkZFQkNELCAnYmx1ZSc6IDB4MDAwMEZGLCAnYmx1ZXZpb2xldCc6IDB4OEEyQkUyLFxuXHQnYnJvd24nOiAweEE1MkEyQSwgJ2J1cmx5d29vZCc6IDB4REVCODg3LCAnY2FkZXRibHVlJzogMHg1RjlFQTAsICdjaGFydHJldXNlJzogMHg3RkZGMDAsICdjaG9jb2xhdGUnOiAweEQyNjkxRSwgJ2NvcmFsJzogMHhGRjdGNTAsXG5cdCdjb3JuZmxvd2VyYmx1ZSc6IDB4NjQ5NUVELCAnY29ybnNpbGsnOiAweEZGRjhEQywgJ2NyaW1zb24nOiAweERDMTQzQywgJ2N5YW4nOiAweDAwRkZGRiwgJ2RhcmtibHVlJzogMHgwMDAwOEIsICdkYXJrY3lhbic6IDB4MDA4QjhCLFxuXHQnZGFya2dvbGRlbnJvZCc6IDB4Qjg4NjBCLCAnZGFya2dyYXknOiAweEE5QTlBOSwgJ2RhcmtncmVlbic6IDB4MDA2NDAwLCAnZGFya2dyZXknOiAweEE5QTlBOSwgJ2RhcmtraGFraSc6IDB4QkRCNzZCLCAnZGFya21hZ2VudGEnOiAweDhCMDA4Qixcblx0J2RhcmtvbGl2ZWdyZWVuJzogMHg1NTZCMkYsICdkYXJrb3JhbmdlJzogMHhGRjhDMDAsICdkYXJrb3JjaGlkJzogMHg5OTMyQ0MsICdkYXJrcmVkJzogMHg4QjAwMDAsICdkYXJrc2FsbW9uJzogMHhFOTk2N0EsICdkYXJrc2VhZ3JlZW4nOiAweDhGQkM4Rixcblx0J2RhcmtzbGF0ZWJsdWUnOiAweDQ4M0Q4QiwgJ2RhcmtzbGF0ZWdyYXknOiAweDJGNEY0RiwgJ2RhcmtzbGF0ZWdyZXknOiAweDJGNEY0RiwgJ2Rhcmt0dXJxdW9pc2UnOiAweDAwQ0VEMSwgJ2Rhcmt2aW9sZXQnOiAweDk0MDBEMyxcblx0J2RlZXBwaW5rJzogMHhGRjE0OTMsICdkZWVwc2t5Ymx1ZSc6IDB4MDBCRkZGLCAnZGltZ3JheSc6IDB4Njk2OTY5LCAnZGltZ3JleSc6IDB4Njk2OTY5LCAnZG9kZ2VyYmx1ZSc6IDB4MUU5MEZGLCAnZmlyZWJyaWNrJzogMHhCMjIyMjIsXG5cdCdmbG9yYWx3aGl0ZSc6IDB4RkZGQUYwLCAnZm9yZXN0Z3JlZW4nOiAweDIyOEIyMiwgJ2Z1Y2hzaWEnOiAweEZGMDBGRiwgJ2dhaW5zYm9ybyc6IDB4RENEQ0RDLCAnZ2hvc3R3aGl0ZSc6IDB4RjhGOEZGLCAnZ29sZCc6IDB4RkZENzAwLFxuXHQnZ29sZGVucm9kJzogMHhEQUE1MjAsICdncmF5JzogMHg4MDgwODAsICdncmVlbic6IDB4MDA4MDAwLCAnZ3JlZW55ZWxsb3cnOiAweEFERkYyRiwgJ2dyZXknOiAweDgwODA4MCwgJ2hvbmV5ZGV3JzogMHhGMEZGRjAsICdob3RwaW5rJzogMHhGRjY5QjQsXG5cdCdpbmRpYW5yZWQnOiAweENENUM1QywgJ2luZGlnbyc6IDB4NEIwMDgyLCAnaXZvcnknOiAweEZGRkZGMCwgJ2toYWtpJzogMHhGMEU2OEMsICdsYXZlbmRlcic6IDB4RTZFNkZBLCAnbGF2ZW5kZXJibHVzaCc6IDB4RkZGMEY1LCAnbGF3bmdyZWVuJzogMHg3Q0ZDMDAsXG5cdCdsZW1vbmNoaWZmb24nOiAweEZGRkFDRCwgJ2xpZ2h0Ymx1ZSc6IDB4QUREOEU2LCAnbGlnaHRjb3JhbCc6IDB4RjA4MDgwLCAnbGlnaHRjeWFuJzogMHhFMEZGRkYsICdsaWdodGdvbGRlbnJvZHllbGxvdyc6IDB4RkFGQUQyLCAnbGlnaHRncmF5JzogMHhEM0QzRDMsXG5cdCdsaWdodGdyZWVuJzogMHg5MEVFOTAsICdsaWdodGdyZXknOiAweEQzRDNEMywgJ2xpZ2h0cGluayc6IDB4RkZCNkMxLCAnbGlnaHRzYWxtb24nOiAweEZGQTA3QSwgJ2xpZ2h0c2VhZ3JlZW4nOiAweDIwQjJBQSwgJ2xpZ2h0c2t5Ymx1ZSc6IDB4ODdDRUZBLFxuXHQnbGlnaHRzbGF0ZWdyYXknOiAweDc3ODg5OSwgJ2xpZ2h0c2xhdGVncmV5JzogMHg3Nzg4OTksICdsaWdodHN0ZWVsYmx1ZSc6IDB4QjBDNERFLCAnbGlnaHR5ZWxsb3cnOiAweEZGRkZFMCwgJ2xpbWUnOiAweDAwRkYwMCwgJ2xpbWVncmVlbic6IDB4MzJDRDMyLFxuXHQnbGluZW4nOiAweEZBRjBFNiwgJ21hZ2VudGEnOiAweEZGMDBGRiwgJ21hcm9vbic6IDB4ODAwMDAwLCAnbWVkaXVtYXF1YW1hcmluZSc6IDB4NjZDREFBLCAnbWVkaXVtYmx1ZSc6IDB4MDAwMENELCAnbWVkaXVtb3JjaGlkJzogMHhCQTU1RDMsXG5cdCdtZWRpdW1wdXJwbGUnOiAweDkzNzBEQiwgJ21lZGl1bXNlYWdyZWVuJzogMHgzQ0IzNzEsICdtZWRpdW1zbGF0ZWJsdWUnOiAweDdCNjhFRSwgJ21lZGl1bXNwcmluZ2dyZWVuJzogMHgwMEZBOUEsICdtZWRpdW10dXJxdW9pc2UnOiAweDQ4RDFDQyxcblx0J21lZGl1bXZpb2xldHJlZCc6IDB4QzcxNTg1LCAnbWlkbmlnaHRibHVlJzogMHgxOTE5NzAsICdtaW50Y3JlYW0nOiAweEY1RkZGQSwgJ21pc3R5cm9zZSc6IDB4RkZFNEUxLCAnbW9jY2FzaW4nOiAweEZGRTRCNSwgJ25hdmFqb3doaXRlJzogMHhGRkRFQUQsXG5cdCduYXZ5JzogMHgwMDAwODAsICdvbGRsYWNlJzogMHhGREY1RTYsICdvbGl2ZSc6IDB4ODA4MDAwLCAnb2xpdmVkcmFiJzogMHg2QjhFMjMsICdvcmFuZ2UnOiAweEZGQTUwMCwgJ29yYW5nZXJlZCc6IDB4RkY0NTAwLCAnb3JjaGlkJzogMHhEQTcwRDYsXG5cdCdwYWxlZ29sZGVucm9kJzogMHhFRUU4QUEsICdwYWxlZ3JlZW4nOiAweDk4RkI5OCwgJ3BhbGV0dXJxdW9pc2UnOiAweEFGRUVFRSwgJ3BhbGV2aW9sZXRyZWQnOiAweERCNzA5MywgJ3BhcGF5YXdoaXAnOiAweEZGRUZENSwgJ3BlYWNocHVmZic6IDB4RkZEQUI5LFxuXHQncGVydSc6IDB4Q0Q4NTNGLCAncGluayc6IDB4RkZDMENCLCAncGx1bSc6IDB4RERBMERELCAncG93ZGVyYmx1ZSc6IDB4QjBFMEU2LCAncHVycGxlJzogMHg4MDAwODAsICdyZWJlY2NhcHVycGxlJzogMHg2NjMzOTksICdyZWQnOiAweEZGMDAwMCwgJ3Jvc3licm93bic6IDB4QkM4RjhGLFxuXHQncm95YWxibHVlJzogMHg0MTY5RTEsICdzYWRkbGVicm93bic6IDB4OEI0NTEzLCAnc2FsbW9uJzogMHhGQTgwNzIsICdzYW5keWJyb3duJzogMHhGNEE0NjAsICdzZWFncmVlbic6IDB4MkU4QjU3LCAnc2Vhc2hlbGwnOiAweEZGRjVFRSxcblx0J3NpZW5uYSc6IDB4QTA1MjJELCAnc2lsdmVyJzogMHhDMEMwQzAsICdza3libHVlJzogMHg4N0NFRUIsICdzbGF0ZWJsdWUnOiAweDZBNUFDRCwgJ3NsYXRlZ3JheSc6IDB4NzA4MDkwLCAnc2xhdGVncmV5JzogMHg3MDgwOTAsICdzbm93JzogMHhGRkZBRkEsXG5cdCdzcHJpbmdncmVlbic6IDB4MDBGRjdGLCAnc3RlZWxibHVlJzogMHg0NjgyQjQsICd0YW4nOiAweEQyQjQ4QywgJ3RlYWwnOiAweDAwODA4MCwgJ3RoaXN0bGUnOiAweEQ4QkZEOCwgJ3RvbWF0byc6IDB4RkY2MzQ3LCAndHVycXVvaXNlJzogMHg0MEUwRDAsXG5cdCd2aW9sZXQnOiAweEVFODJFRSwgJ3doZWF0JzogMHhGNURFQjMsICd3aGl0ZSc6IDB4RkZGRkZGLCAnd2hpdGVzbW9rZSc6IDB4RjVGNUY1LCAneWVsbG93JzogMHhGRkZGMDAsICd5ZWxsb3dncmVlbic6IDB4OUFDRDMyIH07XG5cbmNvbnN0IF9oc2xBID0geyBoOiAwLCBzOiAwLCBsOiAwIH07XG5jb25zdCBfaHNsQiA9IHsgaDogMCwgczogMCwgbDogMCB9O1xuXG5mdW5jdGlvbiBodWUycmdiKCBwLCBxLCB0ICkge1xuXG5cdGlmICggdCA8IDAgKSB0ICs9IDE7XG5cdGlmICggdCA+IDEgKSB0IC09IDE7XG5cdGlmICggdCA8IDEgLyA2ICkgcmV0dXJuIHAgKyAoIHEgLSBwICkgKiA2ICogdDtcblx0aWYgKCB0IDwgMSAvIDIgKSByZXR1cm4gcTtcblx0aWYgKCB0IDwgMiAvIDMgKSByZXR1cm4gcCArICggcSAtIHAgKSAqIDYgKiAoIDIgLyAzIC0gdCApO1xuXHRyZXR1cm4gcDtcblxufVxuXG5jbGFzcyBDb2xvciB7XG5cblx0Y29uc3RydWN0b3IoIHIsIGcsIGIgKSB7XG5cblx0XHR0aGlzLmlzQ29sb3IgPSB0cnVlO1xuXG5cdFx0dGhpcy5yID0gMTtcblx0XHR0aGlzLmcgPSAxO1xuXHRcdHRoaXMuYiA9IDE7XG5cblx0XHRyZXR1cm4gdGhpcy5zZXQoIHIsIGcsIGIgKTtcblxuXHR9XG5cblx0c2V0KCByLCBnLCBiICkge1xuXG5cdFx0aWYgKCBnID09PSB1bmRlZmluZWQgJiYgYiA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHQvLyByIGlzIFRIUkVFLkNvbG9yLCBoZXggb3Igc3RyaW5nXG5cblx0XHRcdGNvbnN0IHZhbHVlID0gcjtcblxuXHRcdFx0aWYgKCB2YWx1ZSAmJiB2YWx1ZS5pc0NvbG9yICkge1xuXG5cdFx0XHRcdHRoaXMuY29weSggdmFsdWUgKTtcblxuXHRcdFx0fSBlbHNlIGlmICggdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyApIHtcblxuXHRcdFx0XHR0aGlzLnNldEhleCggdmFsdWUgKTtcblxuXHRcdFx0fSBlbHNlIGlmICggdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyApIHtcblxuXHRcdFx0XHR0aGlzLnNldFN0eWxlKCB2YWx1ZSApO1xuXG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR0aGlzLnNldFJHQiggciwgZywgYiApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldFNjYWxhciggc2NhbGFyICkge1xuXG5cdFx0dGhpcy5yID0gc2NhbGFyO1xuXHRcdHRoaXMuZyA9IHNjYWxhcjtcblx0XHR0aGlzLmIgPSBzY2FsYXI7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0SGV4KCBoZXgsIGNvbG9yU3BhY2UgPSBTUkdCQ29sb3JTcGFjZSApIHtcblxuXHRcdGhleCA9IE1hdGguZmxvb3IoIGhleCApO1xuXG5cdFx0dGhpcy5yID0gKCBoZXggPj4gMTYgJiAyNTUgKSAvIDI1NTtcblx0XHR0aGlzLmcgPSAoIGhleCA+PiA4ICYgMjU1ICkgLyAyNTU7XG5cdFx0dGhpcy5iID0gKCBoZXggJiAyNTUgKSAvIDI1NTtcblxuXHRcdENvbG9yTWFuYWdlbWVudC50b1dvcmtpbmdDb2xvclNwYWNlKCB0aGlzLCBjb2xvclNwYWNlICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0UkdCKCByLCBnLCBiLCBjb2xvclNwYWNlID0gQ29sb3JNYW5hZ2VtZW50LndvcmtpbmdDb2xvclNwYWNlICkge1xuXG5cdFx0dGhpcy5yID0gcjtcblx0XHR0aGlzLmcgPSBnO1xuXHRcdHRoaXMuYiA9IGI7XG5cblx0XHRDb2xvck1hbmFnZW1lbnQudG9Xb3JraW5nQ29sb3JTcGFjZSggdGhpcywgY29sb3JTcGFjZSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEhTTCggaCwgcywgbCwgY29sb3JTcGFjZSA9IENvbG9yTWFuYWdlbWVudC53b3JraW5nQ29sb3JTcGFjZSApIHtcblxuXHRcdC8vIGgscyxsIHJhbmdlcyBhcmUgaW4gMC4wIC0gMS4wXG5cdFx0aCA9IGV1Y2xpZGVhbk1vZHVsbyggaCwgMSApO1xuXHRcdHMgPSBjbGFtcCggcywgMCwgMSApO1xuXHRcdGwgPSBjbGFtcCggbCwgMCwgMSApO1xuXG5cdFx0aWYgKCBzID09PSAwICkge1xuXG5cdFx0XHR0aGlzLnIgPSB0aGlzLmcgPSB0aGlzLmIgPSBsO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Y29uc3QgcCA9IGwgPD0gMC41ID8gbCAqICggMSArIHMgKSA6IGwgKyBzIC0gKCBsICogcyApO1xuXHRcdFx0Y29uc3QgcSA9ICggMiAqIGwgKSAtIHA7XG5cblx0XHRcdHRoaXMuciA9IGh1ZTJyZ2IoIHEsIHAsIGggKyAxIC8gMyApO1xuXHRcdFx0dGhpcy5nID0gaHVlMnJnYiggcSwgcCwgaCApO1xuXHRcdFx0dGhpcy5iID0gaHVlMnJnYiggcSwgcCwgaCAtIDEgLyAzICk7XG5cblx0XHR9XG5cblx0XHRDb2xvck1hbmFnZW1lbnQudG9Xb3JraW5nQ29sb3JTcGFjZSggdGhpcywgY29sb3JTcGFjZSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldFN0eWxlKCBzdHlsZSwgY29sb3JTcGFjZSA9IFNSR0JDb2xvclNwYWNlICkge1xuXG5cdFx0ZnVuY3Rpb24gaGFuZGxlQWxwaGEoIHN0cmluZyApIHtcblxuXHRcdFx0aWYgKCBzdHJpbmcgPT09IHVuZGVmaW5lZCApIHJldHVybjtcblxuXHRcdFx0aWYgKCBwYXJzZUZsb2F0KCBzdHJpbmcgKSA8IDEgKSB7XG5cblx0XHRcdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuQ29sb3I6IEFscGhhIGNvbXBvbmVudCBvZiAnICsgc3R5bGUgKyAnIHdpbGwgYmUgaWdub3JlZC4nICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXG5cdFx0bGV0IG07XG5cblx0XHRpZiAoIG0gPSAvXihcXHcrKVxcKChbXlxcKV0qKVxcKS8uZXhlYyggc3R5bGUgKSApIHtcblxuXHRcdFx0Ly8gcmdiIC8gaHNsXG5cblx0XHRcdGxldCBjb2xvcjtcblx0XHRcdGNvbnN0IG5hbWUgPSBtWyAxIF07XG5cdFx0XHRjb25zdCBjb21wb25lbnRzID0gbVsgMiBdO1xuXG5cdFx0XHRzd2l0Y2ggKCBuYW1lICkge1xuXG5cdFx0XHRcdGNhc2UgJ3JnYic6XG5cdFx0XHRcdGNhc2UgJ3JnYmEnOlxuXG5cdFx0XHRcdFx0aWYgKCBjb2xvciA9IC9eXFxzKihcXGQrKVxccyosXFxzKihcXGQrKVxccyosXFxzKihcXGQrKVxccyooPzosXFxzKihcXGQqXFwuP1xcZCspXFxzKik/JC8uZXhlYyggY29tcG9uZW50cyApICkge1xuXG5cdFx0XHRcdFx0XHQvLyByZ2IoMjU1LDAsMCkgcmdiYSgyNTUsMCwwLDAuNSlcblxuXHRcdFx0XHRcdFx0aGFuZGxlQWxwaGEoIGNvbG9yWyA0IF0gKTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0UkdCKFxuXHRcdFx0XHRcdFx0XHRNYXRoLm1pbiggMjU1LCBwYXJzZUludCggY29sb3JbIDEgXSwgMTAgKSApIC8gMjU1LFxuXHRcdFx0XHRcdFx0XHRNYXRoLm1pbiggMjU1LCBwYXJzZUludCggY29sb3JbIDIgXSwgMTAgKSApIC8gMjU1LFxuXHRcdFx0XHRcdFx0XHRNYXRoLm1pbiggMjU1LCBwYXJzZUludCggY29sb3JbIDMgXSwgMTAgKSApIC8gMjU1LFxuXHRcdFx0XHRcdFx0XHRjb2xvclNwYWNlXG5cdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCBjb2xvciA9IC9eXFxzKihcXGQrKVxcJVxccyosXFxzKihcXGQrKVxcJVxccyosXFxzKihcXGQrKVxcJVxccyooPzosXFxzKihcXGQqXFwuP1xcZCspXFxzKik/JC8uZXhlYyggY29tcG9uZW50cyApICkge1xuXG5cdFx0XHRcdFx0XHQvLyByZ2IoMTAwJSwwJSwwJSkgcmdiYSgxMDAlLDAlLDAlLDAuNSlcblxuXHRcdFx0XHRcdFx0aGFuZGxlQWxwaGEoIGNvbG9yWyA0IF0gKTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0UkdCKFxuXHRcdFx0XHRcdFx0XHRNYXRoLm1pbiggMTAwLCBwYXJzZUludCggY29sb3JbIDEgXSwgMTAgKSApIC8gMTAwLFxuXHRcdFx0XHRcdFx0XHRNYXRoLm1pbiggMTAwLCBwYXJzZUludCggY29sb3JbIDIgXSwgMTAgKSApIC8gMTAwLFxuXHRcdFx0XHRcdFx0XHRNYXRoLm1pbiggMTAwLCBwYXJzZUludCggY29sb3JbIDMgXSwgMTAgKSApIC8gMTAwLFxuXHRcdFx0XHRcdFx0XHRjb2xvclNwYWNlXG5cdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAnaHNsJzpcblx0XHRcdFx0Y2FzZSAnaHNsYSc6XG5cblx0XHRcdFx0XHRpZiAoIGNvbG9yID0gL15cXHMqKFxcZCpcXC4/XFxkKylcXHMqLFxccyooXFxkKlxcLj9cXGQrKVxcJVxccyosXFxzKihcXGQqXFwuP1xcZCspXFwlXFxzKig/OixcXHMqKFxcZCpcXC4/XFxkKylcXHMqKT8kLy5leGVjKCBjb21wb25lbnRzICkgKSB7XG5cblx0XHRcdFx0XHRcdC8vIGhzbCgxMjAsNTAlLDUwJSkgaHNsYSgxMjAsNTAlLDUwJSwwLjUpXG5cblx0XHRcdFx0XHRcdGhhbmRsZUFscGhhKCBjb2xvclsgNCBdICk7XG5cblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLnNldEhTTChcblx0XHRcdFx0XHRcdFx0cGFyc2VGbG9hdCggY29sb3JbIDEgXSApIC8gMzYwLFxuXHRcdFx0XHRcdFx0XHRwYXJzZUZsb2F0KCBjb2xvclsgMiBdICkgLyAxMDAsXG5cdFx0XHRcdFx0XHRcdHBhcnNlRmxvYXQoIGNvbG9yWyAzIF0gKSAvIDEwMCxcblx0XHRcdFx0XHRcdFx0Y29sb3JTcGFjZVxuXHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGRlZmF1bHQ6XG5cblx0XHRcdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5Db2xvcjogVW5rbm93biBjb2xvciBtb2RlbCAnICsgc3R5bGUgKTtcblxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIGlmICggbSA9IC9eXFwjKFtBLUZhLWZcXGRdKykkLy5leGVjKCBzdHlsZSApICkge1xuXG5cdFx0XHQvLyBoZXggY29sb3JcblxuXHRcdFx0Y29uc3QgaGV4ID0gbVsgMSBdO1xuXHRcdFx0Y29uc3Qgc2l6ZSA9IGhleC5sZW5ndGg7XG5cblx0XHRcdGlmICggc2l6ZSA9PT0gMyApIHtcblxuXHRcdFx0XHQvLyAjZmYwXG5cdFx0XHRcdHJldHVybiB0aGlzLnNldFJHQihcblx0XHRcdFx0XHRwYXJzZUludCggaGV4LmNoYXJBdCggMCApLCAxNiApIC8gMTUsXG5cdFx0XHRcdFx0cGFyc2VJbnQoIGhleC5jaGFyQXQoIDEgKSwgMTYgKSAvIDE1LFxuXHRcdFx0XHRcdHBhcnNlSW50KCBoZXguY2hhckF0KCAyICksIDE2ICkgLyAxNSxcblx0XHRcdFx0XHRjb2xvclNwYWNlXG5cdFx0XHRcdCk7XG5cblx0XHRcdH0gZWxzZSBpZiAoIHNpemUgPT09IDYgKSB7XG5cblx0XHRcdFx0Ly8gI2ZmMDAwMFxuXHRcdFx0XHRyZXR1cm4gdGhpcy5zZXRIZXgoIHBhcnNlSW50KCBoZXgsIDE2ICksIGNvbG9yU3BhY2UgKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5Db2xvcjogSW52YWxpZCBoZXggY29sb3IgJyArIHN0eWxlICk7XG5cblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZiAoIHN0eWxlICYmIHN0eWxlLmxlbmd0aCA+IDAgKSB7XG5cblx0XHRcdHJldHVybiB0aGlzLnNldENvbG9yTmFtZSggc3R5bGUsIGNvbG9yU3BhY2UgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRDb2xvck5hbWUoIHN0eWxlLCBjb2xvclNwYWNlID0gU1JHQkNvbG9yU3BhY2UgKSB7XG5cblx0XHQvLyBjb2xvciBrZXl3b3Jkc1xuXHRcdGNvbnN0IGhleCA9IF9jb2xvcktleXdvcmRzWyBzdHlsZS50b0xvd2VyQ2FzZSgpIF07XG5cblx0XHRpZiAoIGhleCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHQvLyByZWRcblx0XHRcdHRoaXMuc2V0SGV4KCBoZXgsIGNvbG9yU3BhY2UgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdC8vIHVua25vd24gY29sb3Jcblx0XHRcdGNvbnNvbGUud2FybiggJ1RIUkVFLkNvbG9yOiBVbmtub3duIGNvbG9yICcgKyBzdHlsZSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNsb25lKCkge1xuXG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCB0aGlzLnIsIHRoaXMuZywgdGhpcy5iICk7XG5cblx0fVxuXG5cdGNvcHkoIGNvbG9yICkge1xuXG5cdFx0dGhpcy5yID0gY29sb3Iucjtcblx0XHR0aGlzLmcgPSBjb2xvci5nO1xuXHRcdHRoaXMuYiA9IGNvbG9yLmI7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y29weVNSR0JUb0xpbmVhciggY29sb3IgKSB7XG5cblx0XHR0aGlzLnIgPSBTUkdCVG9MaW5lYXIoIGNvbG9yLnIgKTtcblx0XHR0aGlzLmcgPSBTUkdCVG9MaW5lYXIoIGNvbG9yLmcgKTtcblx0XHR0aGlzLmIgPSBTUkdCVG9MaW5lYXIoIGNvbG9yLmIgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjb3B5TGluZWFyVG9TUkdCKCBjb2xvciApIHtcblxuXHRcdHRoaXMuciA9IExpbmVhclRvU1JHQiggY29sb3IuciApO1xuXHRcdHRoaXMuZyA9IExpbmVhclRvU1JHQiggY29sb3IuZyApO1xuXHRcdHRoaXMuYiA9IExpbmVhclRvU1JHQiggY29sb3IuYiApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNvbnZlcnRTUkdCVG9MaW5lYXIoKSB7XG5cblx0XHR0aGlzLmNvcHlTUkdCVG9MaW5lYXIoIHRoaXMgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjb252ZXJ0TGluZWFyVG9TUkdCKCkge1xuXG5cdFx0dGhpcy5jb3B5TGluZWFyVG9TUkdCKCB0aGlzICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Z2V0SGV4KCBjb2xvclNwYWNlID0gU1JHQkNvbG9yU3BhY2UgKSB7XG5cblx0XHRDb2xvck1hbmFnZW1lbnQuZnJvbVdvcmtpbmdDb2xvclNwYWNlKCBfY29sb3IuY29weSggdGhpcyApLCBjb2xvclNwYWNlICk7XG5cblx0XHRyZXR1cm4gTWF0aC5yb3VuZCggY2xhbXAoIF9jb2xvci5yICogMjU1LCAwLCAyNTUgKSApICogNjU1MzYgKyBNYXRoLnJvdW5kKCBjbGFtcCggX2NvbG9yLmcgKiAyNTUsIDAsIDI1NSApICkgKiAyNTYgKyBNYXRoLnJvdW5kKCBjbGFtcCggX2NvbG9yLmIgKiAyNTUsIDAsIDI1NSApICk7XG5cblx0fVxuXG5cdGdldEhleFN0cmluZyggY29sb3JTcGFjZSA9IFNSR0JDb2xvclNwYWNlICkge1xuXG5cdFx0cmV0dXJuICggJzAwMDAwMCcgKyB0aGlzLmdldEhleCggY29sb3JTcGFjZSApLnRvU3RyaW5nKCAxNiApICkuc2xpY2UoIC0gNiApO1xuXG5cdH1cblxuXHRnZXRIU0woIHRhcmdldCwgY29sb3JTcGFjZSA9IENvbG9yTWFuYWdlbWVudC53b3JraW5nQ29sb3JTcGFjZSApIHtcblxuXHRcdC8vIGgscyxsIHJhbmdlcyBhcmUgaW4gMC4wIC0gMS4wXG5cblx0XHRDb2xvck1hbmFnZW1lbnQuZnJvbVdvcmtpbmdDb2xvclNwYWNlKCBfY29sb3IuY29weSggdGhpcyApLCBjb2xvclNwYWNlICk7XG5cblx0XHRjb25zdCByID0gX2NvbG9yLnIsIGcgPSBfY29sb3IuZywgYiA9IF9jb2xvci5iO1xuXG5cdFx0Y29uc3QgbWF4ID0gTWF0aC5tYXgoIHIsIGcsIGIgKTtcblx0XHRjb25zdCBtaW4gPSBNYXRoLm1pbiggciwgZywgYiApO1xuXG5cdFx0bGV0IGh1ZSwgc2F0dXJhdGlvbjtcblx0XHRjb25zdCBsaWdodG5lc3MgPSAoIG1pbiArIG1heCApIC8gMi4wO1xuXG5cdFx0aWYgKCBtaW4gPT09IG1heCApIHtcblxuXHRcdFx0aHVlID0gMDtcblx0XHRcdHNhdHVyYXRpb24gPSAwO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Y29uc3QgZGVsdGEgPSBtYXggLSBtaW47XG5cblx0XHRcdHNhdHVyYXRpb24gPSBsaWdodG5lc3MgPD0gMC41ID8gZGVsdGEgLyAoIG1heCArIG1pbiApIDogZGVsdGEgLyAoIDIgLSBtYXggLSBtaW4gKTtcblxuXHRcdFx0c3dpdGNoICggbWF4ICkge1xuXG5cdFx0XHRcdGNhc2UgcjogaHVlID0gKCBnIC0gYiApIC8gZGVsdGEgKyAoIGcgPCBiID8gNiA6IDAgKTsgYnJlYWs7XG5cdFx0XHRcdGNhc2UgZzogaHVlID0gKCBiIC0gciApIC8gZGVsdGEgKyAyOyBicmVhaztcblx0XHRcdFx0Y2FzZSBiOiBodWUgPSAoIHIgLSBnICkgLyBkZWx0YSArIDQ7IGJyZWFrO1xuXG5cdFx0XHR9XG5cblx0XHRcdGh1ZSAvPSA2O1xuXG5cdFx0fVxuXG5cdFx0dGFyZ2V0LmggPSBodWU7XG5cdFx0dGFyZ2V0LnMgPSBzYXR1cmF0aW9uO1xuXHRcdHRhcmdldC5sID0gbGlnaHRuZXNzO1xuXG5cdFx0cmV0dXJuIHRhcmdldDtcblxuXHR9XG5cblx0Z2V0UkdCKCB0YXJnZXQsIGNvbG9yU3BhY2UgPSBDb2xvck1hbmFnZW1lbnQud29ya2luZ0NvbG9yU3BhY2UgKSB7XG5cblx0XHRDb2xvck1hbmFnZW1lbnQuZnJvbVdvcmtpbmdDb2xvclNwYWNlKCBfY29sb3IuY29weSggdGhpcyApLCBjb2xvclNwYWNlICk7XG5cblx0XHR0YXJnZXQuciA9IF9jb2xvci5yO1xuXHRcdHRhcmdldC5nID0gX2NvbG9yLmc7XG5cdFx0dGFyZ2V0LmIgPSBfY29sb3IuYjtcblxuXHRcdHJldHVybiB0YXJnZXQ7XG5cblx0fVxuXG5cdGdldFN0eWxlKCBjb2xvclNwYWNlID0gU1JHQkNvbG9yU3BhY2UgKSB7XG5cblx0XHRDb2xvck1hbmFnZW1lbnQuZnJvbVdvcmtpbmdDb2xvclNwYWNlKCBfY29sb3IuY29weSggdGhpcyApLCBjb2xvclNwYWNlICk7XG5cblx0XHRjb25zdCByID0gX2NvbG9yLnIsIGcgPSBfY29sb3IuZywgYiA9IF9jb2xvci5iO1xuXG5cdFx0aWYgKCBjb2xvclNwYWNlICE9PSBTUkdCQ29sb3JTcGFjZSApIHtcblxuXHRcdFx0Ly8gUmVxdWlyZXMgQ1NTIENvbG9yIE1vZHVsZSBMZXZlbCA0IChodHRwczovL3d3dy53My5vcmcvVFIvY3NzLWNvbG9yLTQvKS5cblx0XHRcdHJldHVybiBgY29sb3IoJHsgY29sb3JTcGFjZSB9ICR7IHIudG9GaXhlZCggMyApIH0gJHsgZy50b0ZpeGVkKCAzICkgfSAkeyBiLnRvRml4ZWQoIDMgKSB9KWA7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gYHJnYigkeyBNYXRoLnJvdW5kKCByICogMjU1ICkgfSwkeyBNYXRoLnJvdW5kKCBnICogMjU1ICkgfSwkeyBNYXRoLnJvdW5kKCBiICogMjU1ICkgfSlgO1xuXG5cdH1cblxuXHRvZmZzZXRIU0woIGgsIHMsIGwgKSB7XG5cblx0XHR0aGlzLmdldEhTTCggX2hzbEEgKTtcblxuXHRcdF9oc2xBLmggKz0gaDsgX2hzbEEucyArPSBzOyBfaHNsQS5sICs9IGw7XG5cblx0XHR0aGlzLnNldEhTTCggX2hzbEEuaCwgX2hzbEEucywgX2hzbEEubCApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGFkZCggY29sb3IgKSB7XG5cblx0XHR0aGlzLnIgKz0gY29sb3Iucjtcblx0XHR0aGlzLmcgKz0gY29sb3IuZztcblx0XHR0aGlzLmIgKz0gY29sb3IuYjtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhZGRDb2xvcnMoIGNvbG9yMSwgY29sb3IyICkge1xuXG5cdFx0dGhpcy5yID0gY29sb3IxLnIgKyBjb2xvcjIucjtcblx0XHR0aGlzLmcgPSBjb2xvcjEuZyArIGNvbG9yMi5nO1xuXHRcdHRoaXMuYiA9IGNvbG9yMS5iICsgY29sb3IyLmI7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0YWRkU2NhbGFyKCBzICkge1xuXG5cdFx0dGhpcy5yICs9IHM7XG5cdFx0dGhpcy5nICs9IHM7XG5cdFx0dGhpcy5iICs9IHM7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c3ViKCBjb2xvciApIHtcblxuXHRcdHRoaXMuciA9IE1hdGgubWF4KCAwLCB0aGlzLnIgLSBjb2xvci5yICk7XG5cdFx0dGhpcy5nID0gTWF0aC5tYXgoIDAsIHRoaXMuZyAtIGNvbG9yLmcgKTtcblx0XHR0aGlzLmIgPSBNYXRoLm1heCggMCwgdGhpcy5iIC0gY29sb3IuYiApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG11bHRpcGx5KCBjb2xvciApIHtcblxuXHRcdHRoaXMuciAqPSBjb2xvci5yO1xuXHRcdHRoaXMuZyAqPSBjb2xvci5nO1xuXHRcdHRoaXMuYiAqPSBjb2xvci5iO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG11bHRpcGx5U2NhbGFyKCBzICkge1xuXG5cdFx0dGhpcy5yICo9IHM7XG5cdFx0dGhpcy5nICo9IHM7XG5cdFx0dGhpcy5iICo9IHM7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bGVycCggY29sb3IsIGFscGhhICkge1xuXG5cdFx0dGhpcy5yICs9ICggY29sb3IuciAtIHRoaXMuciApICogYWxwaGE7XG5cdFx0dGhpcy5nICs9ICggY29sb3IuZyAtIHRoaXMuZyApICogYWxwaGE7XG5cdFx0dGhpcy5iICs9ICggY29sb3IuYiAtIHRoaXMuYiApICogYWxwaGE7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bGVycENvbG9ycyggY29sb3IxLCBjb2xvcjIsIGFscGhhICkge1xuXG5cdFx0dGhpcy5yID0gY29sb3IxLnIgKyAoIGNvbG9yMi5yIC0gY29sb3IxLnIgKSAqIGFscGhhO1xuXHRcdHRoaXMuZyA9IGNvbG9yMS5nICsgKCBjb2xvcjIuZyAtIGNvbG9yMS5nICkgKiBhbHBoYTtcblx0XHR0aGlzLmIgPSBjb2xvcjEuYiArICggY29sb3IyLmIgLSBjb2xvcjEuYiApICogYWxwaGE7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bGVycEhTTCggY29sb3IsIGFscGhhICkge1xuXG5cdFx0dGhpcy5nZXRIU0woIF9oc2xBICk7XG5cdFx0Y29sb3IuZ2V0SFNMKCBfaHNsQiApO1xuXG5cdFx0Y29uc3QgaCA9IGxlcnAoIF9oc2xBLmgsIF9oc2xCLmgsIGFscGhhICk7XG5cdFx0Y29uc3QgcyA9IGxlcnAoIF9oc2xBLnMsIF9oc2xCLnMsIGFscGhhICk7XG5cdFx0Y29uc3QgbCA9IGxlcnAoIF9oc2xBLmwsIF9oc2xCLmwsIGFscGhhICk7XG5cblx0XHR0aGlzLnNldEhTTCggaCwgcywgbCApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21WZWN0b3IzKCB2ICkge1xuXG5cdFx0dGhpcy5yID0gdi54O1xuXHRcdHRoaXMuZyA9IHYueTtcblx0XHR0aGlzLmIgPSB2Lno7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0YXBwbHlNYXRyaXgzKCBtICkge1xuXG5cdFx0Y29uc3QgciA9IHRoaXMuciwgZyA9IHRoaXMuZywgYiA9IHRoaXMuYjtcblx0XHRjb25zdCBlID0gbS5lbGVtZW50cztcblxuXHRcdHRoaXMuciA9IGVbIDAgXSAqIHIgKyBlWyAzIF0gKiBnICsgZVsgNiBdICogYjtcblx0XHR0aGlzLmcgPSBlWyAxIF0gKiByICsgZVsgNCBdICogZyArIGVbIDcgXSAqIGI7XG5cdFx0dGhpcy5iID0gZVsgMiBdICogciArIGVbIDUgXSAqIGcgKyBlWyA4IF0gKiBiO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGVxdWFscyggYyApIHtcblxuXHRcdHJldHVybiAoIGMuciA9PT0gdGhpcy5yICkgJiYgKCBjLmcgPT09IHRoaXMuZyApICYmICggYy5iID09PSB0aGlzLmIgKTtcblxuXHR9XG5cblx0ZnJvbUFycmF5KCBhcnJheSwgb2Zmc2V0ID0gMCApIHtcblxuXHRcdHRoaXMuciA9IGFycmF5WyBvZmZzZXQgXTtcblx0XHR0aGlzLmcgPSBhcnJheVsgb2Zmc2V0ICsgMSBdO1xuXHRcdHRoaXMuYiA9IGFycmF5WyBvZmZzZXQgKyAyIF07XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0dG9BcnJheSggYXJyYXkgPSBbXSwgb2Zmc2V0ID0gMCApIHtcblxuXHRcdGFycmF5WyBvZmZzZXQgXSA9IHRoaXMucjtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMSBdID0gdGhpcy5nO1xuXHRcdGFycmF5WyBvZmZzZXQgKyAyIF0gPSB0aGlzLmI7XG5cblx0XHRyZXR1cm4gYXJyYXk7XG5cblx0fVxuXG5cdGZyb21CdWZmZXJBdHRyaWJ1dGUoIGF0dHJpYnV0ZSwgaW5kZXggKSB7XG5cblx0XHR0aGlzLnIgPSBhdHRyaWJ1dGUuZ2V0WCggaW5kZXggKTtcblx0XHR0aGlzLmcgPSBhdHRyaWJ1dGUuZ2V0WSggaW5kZXggKTtcblx0XHR0aGlzLmIgPSBhdHRyaWJ1dGUuZ2V0WiggaW5kZXggKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR0b0pTT04oKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5nZXRIZXgoKTtcblxuXHR9XG5cblx0KlsgU3ltYm9sLml0ZXJhdG9yIF0oKSB7XG5cblx0XHR5aWVsZCB0aGlzLnI7XG5cdFx0eWllbGQgdGhpcy5nO1xuXHRcdHlpZWxkIHRoaXMuYjtcblxuXHR9XG5cbn1cblxuY29uc3QgX2NvbG9yID0gLypAX19QVVJFX18qLyBuZXcgQ29sb3IoKTtcblxuQ29sb3IuTkFNRVMgPSBfY29sb3JLZXl3b3JkcztcblxuZXhwb3J0IHsgQ29sb3IgfTtcbiIsImNvbnN0IENhY2hlID0ge1xuXG5cdGVuYWJsZWQ6IGZhbHNlLFxuXG5cdGZpbGVzOiB7fSxcblxuXHRhZGQ6IGZ1bmN0aW9uICgga2V5LCBmaWxlICkge1xuXG5cdFx0aWYgKCB0aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0Ly8gY29uc29sZS5sb2coICdUSFJFRS5DYWNoZScsICdBZGRpbmcga2V5OicsIGtleSApO1xuXG5cdFx0dGhpcy5maWxlc1sga2V5IF0gPSBmaWxlO1xuXG5cdH0sXG5cblx0Z2V0OiBmdW5jdGlvbiAoIGtleSApIHtcblxuXHRcdGlmICggdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdC8vIGNvbnNvbGUubG9nKCAnVEhSRUUuQ2FjaGUnLCAnQ2hlY2tpbmcga2V5OicsIGtleSApO1xuXG5cdFx0cmV0dXJuIHRoaXMuZmlsZXNbIGtleSBdO1xuXG5cdH0sXG5cblx0cmVtb3ZlOiBmdW5jdGlvbiAoIGtleSApIHtcblxuXHRcdGRlbGV0ZSB0aGlzLmZpbGVzWyBrZXkgXTtcblxuXHR9LFxuXG5cdGNsZWFyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHR0aGlzLmZpbGVzID0ge307XG5cblx0fVxuXG59O1xuXG5cbmV4cG9ydCB7IENhY2hlIH07XG4iLCJjbGFzcyBMb2FkaW5nTWFuYWdlciB7XG5cblx0Y29uc3RydWN0b3IoIG9uTG9hZCwgb25Qcm9ncmVzcywgb25FcnJvciApIHtcblxuXHRcdGNvbnN0IHNjb3BlID0gdGhpcztcblxuXHRcdGxldCBpc0xvYWRpbmcgPSBmYWxzZTtcblx0XHRsZXQgaXRlbXNMb2FkZWQgPSAwO1xuXHRcdGxldCBpdGVtc1RvdGFsID0gMDtcblx0XHRsZXQgdXJsTW9kaWZpZXIgPSB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgaGFuZGxlcnMgPSBbXTtcblxuXHRcdC8vIFJlZmVyIHRvICM1Njg5IGZvciB0aGUgcmVhc29uIHdoeSB3ZSBkb24ndCBzZXQgLm9uU3RhcnRcblx0XHQvLyBpbiB0aGUgY29uc3RydWN0b3JcblxuXHRcdHRoaXMub25TdGFydCA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLm9uTG9hZCA9IG9uTG9hZDtcblx0XHR0aGlzLm9uUHJvZ3Jlc3MgPSBvblByb2dyZXNzO1xuXHRcdHRoaXMub25FcnJvciA9IG9uRXJyb3I7XG5cblx0XHR0aGlzLml0ZW1TdGFydCA9IGZ1bmN0aW9uICggdXJsICkge1xuXG5cdFx0XHRpdGVtc1RvdGFsICsrO1xuXG5cdFx0XHRpZiAoIGlzTG9hZGluZyA9PT0gZmFsc2UgKSB7XG5cblx0XHRcdFx0aWYgKCBzY29wZS5vblN0YXJ0ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRzY29wZS5vblN0YXJ0KCB1cmwsIGl0ZW1zTG9hZGVkLCBpdGVtc1RvdGFsICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdGlzTG9hZGluZyA9IHRydWU7XG5cblx0XHR9O1xuXG5cdFx0dGhpcy5pdGVtRW5kID0gZnVuY3Rpb24gKCB1cmwgKSB7XG5cblx0XHRcdGl0ZW1zTG9hZGVkICsrO1xuXG5cdFx0XHRpZiAoIHNjb3BlLm9uUHJvZ3Jlc3MgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRzY29wZS5vblByb2dyZXNzKCB1cmwsIGl0ZW1zTG9hZGVkLCBpdGVtc1RvdGFsICk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBpdGVtc0xvYWRlZCA9PT0gaXRlbXNUb3RhbCApIHtcblxuXHRcdFx0XHRpc0xvYWRpbmcgPSBmYWxzZTtcblxuXHRcdFx0XHRpZiAoIHNjb3BlLm9uTG9hZCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0c2NvcGUub25Mb2FkKCk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9O1xuXG5cdFx0dGhpcy5pdGVtRXJyb3IgPSBmdW5jdGlvbiAoIHVybCApIHtcblxuXHRcdFx0aWYgKCBzY29wZS5vbkVycm9yICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0c2NvcGUub25FcnJvciggdXJsICk7XG5cblx0XHRcdH1cblxuXHRcdH07XG5cblx0XHR0aGlzLnJlc29sdmVVUkwgPSBmdW5jdGlvbiAoIHVybCApIHtcblxuXHRcdFx0aWYgKCB1cmxNb2RpZmllciApIHtcblxuXHRcdFx0XHRyZXR1cm4gdXJsTW9kaWZpZXIoIHVybCApO1xuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB1cmw7XG5cblx0XHR9O1xuXG5cdFx0dGhpcy5zZXRVUkxNb2RpZmllciA9IGZ1bmN0aW9uICggdHJhbnNmb3JtICkge1xuXG5cdFx0XHR1cmxNb2RpZmllciA9IHRyYW5zZm9ybTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHR9O1xuXG5cdFx0dGhpcy5hZGRIYW5kbGVyID0gZnVuY3Rpb24gKCByZWdleCwgbG9hZGVyICkge1xuXG5cdFx0XHRoYW5kbGVycy5wdXNoKCByZWdleCwgbG9hZGVyICk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0fTtcblxuXHRcdHRoaXMucmVtb3ZlSGFuZGxlciA9IGZ1bmN0aW9uICggcmVnZXggKSB7XG5cblx0XHRcdGNvbnN0IGluZGV4ID0gaGFuZGxlcnMuaW5kZXhPZiggcmVnZXggKTtcblxuXHRcdFx0aWYgKCBpbmRleCAhPT0gLSAxICkge1xuXG5cdFx0XHRcdGhhbmRsZXJzLnNwbGljZSggaW5kZXgsIDIgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcztcblxuXHRcdH07XG5cblx0XHR0aGlzLmdldEhhbmRsZXIgPSBmdW5jdGlvbiAoIGZpbGUgKSB7XG5cblx0XHRcdGZvciAoIGxldCBpID0gMCwgbCA9IGhhbmRsZXJzLmxlbmd0aDsgaSA8IGw7IGkgKz0gMiApIHtcblxuXHRcdFx0XHRjb25zdCByZWdleCA9IGhhbmRsZXJzWyBpIF07XG5cdFx0XHRcdGNvbnN0IGxvYWRlciA9IGhhbmRsZXJzWyBpICsgMSBdO1xuXG5cdFx0XHRcdGlmICggcmVnZXguZ2xvYmFsICkgcmVnZXgubGFzdEluZGV4ID0gMDsgLy8gc2VlICMxNzkyMFxuXG5cdFx0XHRcdGlmICggcmVnZXgudGVzdCggZmlsZSApICkge1xuXG5cdFx0XHRcdFx0cmV0dXJuIGxvYWRlcjtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cblx0XHR9O1xuXG5cdH1cblxufVxuXG5jb25zdCBEZWZhdWx0TG9hZGluZ01hbmFnZXIgPSAvKkBfX1BVUkVfXyovIG5ldyBMb2FkaW5nTWFuYWdlcigpO1xuXG5leHBvcnQgeyBEZWZhdWx0TG9hZGluZ01hbmFnZXIsIExvYWRpbmdNYW5hZ2VyIH07XG4iLCJpbXBvcnQgeyBEZWZhdWx0TG9hZGluZ01hbmFnZXIgfSBmcm9tICcuL0xvYWRpbmdNYW5hZ2VyLmpzJztcblxuY2xhc3MgTG9hZGVyIHtcblxuXHRjb25zdHJ1Y3RvciggbWFuYWdlciApIHtcblxuXHRcdHRoaXMubWFuYWdlciA9ICggbWFuYWdlciAhPT0gdW5kZWZpbmVkICkgPyBtYW5hZ2VyIDogRGVmYXVsdExvYWRpbmdNYW5hZ2VyO1xuXG5cdFx0dGhpcy5jcm9zc09yaWdpbiA9ICdhbm9ueW1vdXMnO1xuXHRcdHRoaXMud2l0aENyZWRlbnRpYWxzID0gZmFsc2U7XG5cdFx0dGhpcy5wYXRoID0gJyc7XG5cdFx0dGhpcy5yZXNvdXJjZVBhdGggPSAnJztcblx0XHR0aGlzLnJlcXVlc3RIZWFkZXIgPSB7fTtcblxuXHR9XG5cblx0bG9hZCggLyogdXJsLCBvbkxvYWQsIG9uUHJvZ3Jlc3MsIG9uRXJyb3IgKi8gKSB7fVxuXG5cdGxvYWRBc3luYyggdXJsLCBvblByb2dyZXNzICkge1xuXG5cdFx0Y29uc3Qgc2NvcGUgPSB0aGlzO1xuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKCBmdW5jdGlvbiAoIHJlc29sdmUsIHJlamVjdCApIHtcblxuXHRcdFx0c2NvcGUubG9hZCggdXJsLCByZXNvbHZlLCBvblByb2dyZXNzLCByZWplY3QgKTtcblxuXHRcdH0gKTtcblxuXHR9XG5cblx0cGFyc2UoIC8qIGRhdGEgKi8gKSB7fVxuXG5cdHNldENyb3NzT3JpZ2luKCBjcm9zc09yaWdpbiApIHtcblxuXHRcdHRoaXMuY3Jvc3NPcmlnaW4gPSBjcm9zc09yaWdpbjtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0V2l0aENyZWRlbnRpYWxzKCB2YWx1ZSApIHtcblxuXHRcdHRoaXMud2l0aENyZWRlbnRpYWxzID0gdmFsdWU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldFBhdGgoIHBhdGggKSB7XG5cblx0XHR0aGlzLnBhdGggPSBwYXRoO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRSZXNvdXJjZVBhdGgoIHJlc291cmNlUGF0aCApIHtcblxuXHRcdHRoaXMucmVzb3VyY2VQYXRoID0gcmVzb3VyY2VQYXRoO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRSZXF1ZXN0SGVhZGVyKCByZXF1ZXN0SGVhZGVyICkge1xuXG5cdFx0dGhpcy5yZXF1ZXN0SGVhZGVyID0gcmVxdWVzdEhlYWRlcjtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cbn1cblxuTG9hZGVyLkRFRkFVTFRfTUFURVJJQUxfTkFNRSA9ICdfX0RFRkFVTFQnO1xuXG5leHBvcnQgeyBMb2FkZXIgfTtcbiIsImltcG9ydCB7IENhY2hlIH0gZnJvbSAnLi9DYWNoZS5qcyc7XG5pbXBvcnQgeyBMb2FkZXIgfSBmcm9tICcuL0xvYWRlci5qcyc7XG5cbmNvbnN0IGxvYWRpbmcgPSB7fTtcblxuY2xhc3MgSHR0cEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXG5cdGNvbnN0cnVjdG9yKCBtZXNzYWdlLCByZXNwb25zZSApIHtcblxuXHRcdHN1cGVyKCBtZXNzYWdlICk7XG5cdFx0dGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuXG5cdH1cblxufVxuXG5jbGFzcyBGaWxlTG9hZGVyIGV4dGVuZHMgTG9hZGVyIHtcblxuXHRjb25zdHJ1Y3RvciggbWFuYWdlciApIHtcblxuXHRcdHN1cGVyKCBtYW5hZ2VyICk7XG5cblx0fVxuXG5cdGxvYWQoIHVybCwgb25Mb2FkLCBvblByb2dyZXNzLCBvbkVycm9yICkge1xuXG5cdFx0aWYgKCB1cmwgPT09IHVuZGVmaW5lZCApIHVybCA9ICcnO1xuXG5cdFx0aWYgKCB0aGlzLnBhdGggIT09IHVuZGVmaW5lZCApIHVybCA9IHRoaXMucGF0aCArIHVybDtcblxuXHRcdHVybCA9IHRoaXMubWFuYWdlci5yZXNvbHZlVVJMKCB1cmwgKTtcblxuXHRcdGNvbnN0IGNhY2hlZCA9IENhY2hlLmdldCggdXJsICk7XG5cblx0XHRpZiAoIGNhY2hlZCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHR0aGlzLm1hbmFnZXIuaXRlbVN0YXJ0KCB1cmwgKTtcblxuXHRcdFx0c2V0VGltZW91dCggKCkgPT4ge1xuXG5cdFx0XHRcdGlmICggb25Mb2FkICkgb25Mb2FkKCBjYWNoZWQgKTtcblxuXHRcdFx0XHR0aGlzLm1hbmFnZXIuaXRlbUVuZCggdXJsICk7XG5cblx0XHRcdH0sIDAgKTtcblxuXHRcdFx0cmV0dXJuIGNhY2hlZDtcblxuXHRcdH1cblxuXHRcdC8vIENoZWNrIGlmIHJlcXVlc3QgaXMgZHVwbGljYXRlXG5cblx0XHRpZiAoIGxvYWRpbmdbIHVybCBdICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGxvYWRpbmdbIHVybCBdLnB1c2goIHtcblxuXHRcdFx0XHRvbkxvYWQ6IG9uTG9hZCxcblx0XHRcdFx0b25Qcm9ncmVzczogb25Qcm9ncmVzcyxcblx0XHRcdFx0b25FcnJvcjogb25FcnJvclxuXG5cdFx0XHR9ICk7XG5cblx0XHRcdHJldHVybjtcblxuXHRcdH1cblxuXHRcdC8vIEluaXRpYWxpc2UgYXJyYXkgZm9yIGR1cGxpY2F0ZSByZXF1ZXN0c1xuXHRcdGxvYWRpbmdbIHVybCBdID0gW107XG5cblx0XHRsb2FkaW5nWyB1cmwgXS5wdXNoKCB7XG5cdFx0XHRvbkxvYWQ6IG9uTG9hZCxcblx0XHRcdG9uUHJvZ3Jlc3M6IG9uUHJvZ3Jlc3MsXG5cdFx0XHRvbkVycm9yOiBvbkVycm9yLFxuXHRcdH0gKTtcblxuXHRcdC8vIGNyZWF0ZSByZXF1ZXN0XG5cdFx0Y29uc3QgcmVxID0gbmV3IFJlcXVlc3QoIHVybCwge1xuXHRcdFx0aGVhZGVyczogbmV3IEhlYWRlcnMoIHRoaXMucmVxdWVzdEhlYWRlciApLFxuXHRcdFx0Y3JlZGVudGlhbHM6IHRoaXMud2l0aENyZWRlbnRpYWxzID8gJ2luY2x1ZGUnIDogJ3NhbWUtb3JpZ2luJyxcblx0XHRcdC8vIEFuIGFib3J0IGNvbnRyb2xsZXIgY291bGQgYmUgYWRkZWQgd2l0aGluIGEgZnV0dXJlIFBSXG5cdFx0fSApO1xuXG5cdFx0Ly8gcmVjb3JkIHN0YXRlcyAoIGF2b2lkIGRhdGEgcmFjZSApXG5cdFx0Y29uc3QgbWltZVR5cGUgPSB0aGlzLm1pbWVUeXBlO1xuXHRcdGNvbnN0IHJlc3BvbnNlVHlwZSA9IHRoaXMucmVzcG9uc2VUeXBlO1xuXG5cdFx0Ly8gc3RhcnQgdGhlIGZldGNoXG5cdFx0ZmV0Y2goIHJlcSApXG5cdFx0XHQudGhlbiggcmVzcG9uc2UgPT4ge1xuXG5cdFx0XHRcdGlmICggcmVzcG9uc2Uuc3RhdHVzID09PSAyMDAgfHwgcmVzcG9uc2Uuc3RhdHVzID09PSAwICkge1xuXG5cdFx0XHRcdFx0Ly8gU29tZSBicm93c2VycyByZXR1cm4gSFRUUCBTdGF0dXMgMCB3aGVuIHVzaW5nIG5vbi1odHRwIHByb3RvY29sXG5cdFx0XHRcdFx0Ly8gZS5nLiAnZmlsZTovLycgb3IgJ2RhdGE6Ly8nLiBIYW5kbGUgYXMgc3VjY2Vzcy5cblxuXHRcdFx0XHRcdGlmICggcmVzcG9uc2Uuc3RhdHVzID09PSAwICkge1xuXG5cdFx0XHRcdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5GaWxlTG9hZGVyOiBIVFRQIFN0YXR1cyAwIHJlY2VpdmVkLicgKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIFdvcmthcm91bmQ6IENoZWNraW5nIGlmIHJlc3BvbnNlLmJvZHkgPT09IHVuZGVmaW5lZCBmb3IgQWxpcGF5IGJyb3dzZXIgIzIzNTQ4XG5cblx0XHRcdFx0XHRpZiAoIHR5cGVvZiBSZWFkYWJsZVN0cmVhbSA9PT0gJ3VuZGVmaW5lZCcgfHwgcmVzcG9uc2UuYm9keSA9PT0gdW5kZWZpbmVkIHx8IHJlc3BvbnNlLmJvZHkuZ2V0UmVhZGVyID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRcdHJldHVybiByZXNwb25zZTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnN0IGNhbGxiYWNrcyA9IGxvYWRpbmdbIHVybCBdO1xuXHRcdFx0XHRcdGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHkuZ2V0UmVhZGVyKCk7XG5cblx0XHRcdFx0XHQvLyBOZ2lueCBuZWVkcyBYLUZpbGUtU2l6ZSBjaGVja1xuXHRcdFx0XHRcdC8vIGh0dHBzOi8vc2VydmVyZmF1bHQuY29tL3F1ZXN0aW9ucy80ODI4NzUvd2h5LWRvZXMtbmdpbngtcmVtb3ZlLWNvbnRlbnQtbGVuZ3RoLWhlYWRlci1mb3ItY2h1bmtlZC1jb250ZW50XG5cdFx0XHRcdFx0Y29uc3QgY29udGVudExlbmd0aCA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCAnQ29udGVudC1MZW5ndGgnICkgfHwgcmVzcG9uc2UuaGVhZGVycy5nZXQoICdYLUZpbGUtU2l6ZScgKTtcblx0XHRcdFx0XHRjb25zdCB0b3RhbCA9IGNvbnRlbnRMZW5ndGggPyBwYXJzZUludCggY29udGVudExlbmd0aCApIDogMDtcblx0XHRcdFx0XHRjb25zdCBsZW5ndGhDb21wdXRhYmxlID0gdG90YWwgIT09IDA7XG5cdFx0XHRcdFx0bGV0IGxvYWRlZCA9IDA7XG5cblx0XHRcdFx0XHQvLyBwZXJpb2RpY2FsbHkgcmVhZCBkYXRhIGludG8gdGhlIG5ldyBzdHJlYW0gdHJhY2tpbmcgd2hpbGUgZG93bmxvYWQgcHJvZ3Jlc3Ncblx0XHRcdFx0XHRjb25zdCBzdHJlYW0gPSBuZXcgUmVhZGFibGVTdHJlYW0oIHtcblx0XHRcdFx0XHRcdHN0YXJ0KCBjb250cm9sbGVyICkge1xuXG5cdFx0XHRcdFx0XHRcdHJlYWREYXRhKCk7XG5cblx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gcmVhZERhdGEoKSB7XG5cblx0XHRcdFx0XHRcdFx0XHRyZWFkZXIucmVhZCgpLnRoZW4oICggeyBkb25lLCB2YWx1ZSB9ICkgPT4ge1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIGRvbmUgKSB7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udHJvbGxlci5jbG9zZSgpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxvYWRlZCArPSB2YWx1ZS5ieXRlTGVuZ3RoO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGV2ZW50ID0gbmV3IFByb2dyZXNzRXZlbnQoICdwcm9ncmVzcycsIHsgbGVuZ3RoQ29tcHV0YWJsZSwgbG9hZGVkLCB0b3RhbCB9ICk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZvciAoIGxldCBpID0gMCwgaWwgPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBjYWxsYmFjayA9IGNhbGxiYWNrc1sgaSBdO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICggY2FsbGJhY2sub25Qcm9ncmVzcyApIGNhbGxiYWNrLm9uUHJvZ3Jlc3MoIGV2ZW50ICk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuZW5xdWV1ZSggdmFsdWUgKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmVhZERhdGEoKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBSZXNwb25zZSggc3RyZWFtICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdHRocm93IG5ldyBIdHRwRXJyb3IoIGBmZXRjaCBmb3IgXCIke3Jlc3BvbnNlLnVybH1cIiByZXNwb25kZWQgd2l0aCAke3Jlc3BvbnNlLnN0YXR1c306ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gLCByZXNwb25zZSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fSApXG5cdFx0XHQudGhlbiggcmVzcG9uc2UgPT4ge1xuXG5cdFx0XHRcdHN3aXRjaCAoIHJlc3BvbnNlVHlwZSApIHtcblxuXHRcdFx0XHRcdGNhc2UgJ2FycmF5YnVmZmVyJzpcblxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmFycmF5QnVmZmVyKCk7XG5cblx0XHRcdFx0XHRjYXNlICdibG9iJzpcblxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmJsb2IoKTtcblxuXHRcdFx0XHRcdGNhc2UgJ2RvY3VtZW50JzpcblxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLnRleHQoKVxuXHRcdFx0XHRcdFx0XHQudGhlbiggdGV4dCA9PiB7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zdCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlci5wYXJzZUZyb21TdHJpbmcoIHRleHQsIG1pbWVUeXBlICk7XG5cblx0XHRcdFx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdFx0Y2FzZSAnanNvbic6XG5cblx0XHRcdFx0XHRcdHJldHVybiByZXNwb25zZS5qc29uKCk7XG5cblx0XHRcdFx0XHRkZWZhdWx0OlxuXG5cdFx0XHRcdFx0XHRpZiAoIG1pbWVUeXBlID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcblxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0XHQvLyBzbmlmZiBlbmNvZGluZ1xuXHRcdFx0XHRcdFx0XHRjb25zdCByZSA9IC9jaGFyc2V0PVwiPyhbXjtcIlxcc10qKVwiPy9pO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBleGVjID0gcmUuZXhlYyggbWltZVR5cGUgKTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgbGFiZWwgPSBleGVjICYmIGV4ZWNbIDEgXSA/IGV4ZWNbIDEgXS50b0xvd2VyQ2FzZSgpIDogdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBkZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCBsYWJlbCApO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuYXJyYXlCdWZmZXIoKS50aGVuKCBhYiA9PiBkZWNvZGVyLmRlY29kZSggYWIgKSApO1xuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9IClcblx0XHRcdC50aGVuKCBkYXRhID0+IHtcblxuXHRcdFx0XHQvLyBBZGQgdG8gY2FjaGUgb25seSBvbiBIVFRQIHN1Y2Nlc3MsIHNvIHRoYXQgd2UgZG8gbm90IGNhY2hlXG5cdFx0XHRcdC8vIGVycm9yIHJlc3BvbnNlIGJvZGllcyBhcyBwcm9wZXIgcmVzcG9uc2VzIHRvIHJlcXVlc3RzLlxuXHRcdFx0XHRDYWNoZS5hZGQoIHVybCwgZGF0YSApO1xuXG5cdFx0XHRcdGNvbnN0IGNhbGxiYWNrcyA9IGxvYWRpbmdbIHVybCBdO1xuXHRcdFx0XHRkZWxldGUgbG9hZGluZ1sgdXJsIF07XG5cblx0XHRcdFx0Zm9yICggbGV0IGkgPSAwLCBpbCA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBpbDsgaSArKyApIHtcblxuXHRcdFx0XHRcdGNvbnN0IGNhbGxiYWNrID0gY2FsbGJhY2tzWyBpIF07XG5cdFx0XHRcdFx0aWYgKCBjYWxsYmFjay5vbkxvYWQgKSBjYWxsYmFjay5vbkxvYWQoIGRhdGEgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH0gKVxuXHRcdFx0LmNhdGNoKCBlcnIgPT4ge1xuXG5cdFx0XHRcdC8vIEFib3J0IGVycm9ycyBhbmQgb3RoZXIgZXJyb3JzIGFyZSBoYW5kbGVkIHRoZSBzYW1lXG5cblx0XHRcdFx0Y29uc3QgY2FsbGJhY2tzID0gbG9hZGluZ1sgdXJsIF07XG5cblx0XHRcdFx0aWYgKCBjYWxsYmFja3MgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRcdC8vIFdoZW4gb25Mb2FkIHdhcyBjYWxsZWQgYW5kIHVybCB3YXMgZGVsZXRlZCBpbiBgbG9hZGluZ2Bcblx0XHRcdFx0XHR0aGlzLm1hbmFnZXIuaXRlbUVycm9yKCB1cmwgKTtcblx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRlbGV0ZSBsb2FkaW5nWyB1cmwgXTtcblxuXHRcdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGlsOyBpICsrICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgY2FsbGJhY2sgPSBjYWxsYmFja3NbIGkgXTtcblx0XHRcdFx0XHRpZiAoIGNhbGxiYWNrLm9uRXJyb3IgKSBjYWxsYmFjay5vbkVycm9yKCBlcnIgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5tYW5hZ2VyLml0ZW1FcnJvciggdXJsICk7XG5cblx0XHRcdH0gKVxuXHRcdFx0LmZpbmFsbHkoICgpID0+IHtcblxuXHRcdFx0XHR0aGlzLm1hbmFnZXIuaXRlbUVuZCggdXJsICk7XG5cblx0XHRcdH0gKTtcblxuXHRcdHRoaXMubWFuYWdlci5pdGVtU3RhcnQoIHVybCApO1xuXG5cdH1cblxuXHRzZXRSZXNwb25zZVR5cGUoIHZhbHVlICkge1xuXG5cdFx0dGhpcy5yZXNwb25zZVR5cGUgPSB2YWx1ZTtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0TWltZVR5cGUoIHZhbHVlICkge1xuXG5cdFx0dGhpcy5taW1lVHlwZSA9IHZhbHVlO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxufVxuXG5cbmV4cG9ydCB7IEZpbGVMb2FkZXIgfTtcbiIsImltcG9ydCB7XG5cdEJ1ZmZlckF0dHJpYnV0ZSxcbn0gZnJvbSAnLi4vLi4vLi4vc3JjL2NvcmUvQnVmZmVyQXR0cmlidXRlLmpzJztcbmltcG9ydCB7XG5cdEJ1ZmZlckdlb21ldHJ5LFxufSBmcm9tICcuLi8uLi8uLi9zcmMvY29yZS9CdWZmZXJHZW9tZXRyeS5qcyc7XG5pbXBvcnQge1xuXHRDb2xvcixcbn0gZnJvbSAnLi4vLi4vLi4vc3JjL21hdGgvQ29sb3IuanMnO1xuaW1wb3J0IHtcblx0RmlsZUxvYWRlcixcbn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvYWRlcnMvRmlsZUxvYWRlci5qcyc7XG5pbXBvcnQge1xuXHRMb2FkZXIsXG59IGZyb20gJy4uLy4uLy4uL3NyYy9sb2FkZXJzL0xvYWRlci5qcyc7XG5pbXBvcnQge1xuXHRMaW5lYXJTUkdCQ29sb3JTcGFjZSxTUkdCQ29sb3JTcGFjZVxufSBmcm9tICcuLi8uLi8uLi9zcmMvY29uc3RhbnRzLmpzJztcbmNvbnN0IF90YXNrQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuXG5jbGFzcyBEUkFDT0xvYWRlciBleHRlbmRzIExvYWRlciB7XG5cblx0Y29uc3RydWN0b3IoIG1hbmFnZXIgKSB7XG5cblx0XHRzdXBlciggbWFuYWdlciApO1xuXG5cdFx0dGhpcy5kZWNvZGVyUGF0aCA9ICcnO1xuXHRcdHRoaXMuZGVjb2RlckNvbmZpZyA9IHt9O1xuXHRcdHRoaXMuZGVjb2RlckJpbmFyeSA9IG51bGw7XG5cdFx0dGhpcy5kZWNvZGVyUGVuZGluZyA9IG51bGw7XG5cblx0XHR0aGlzLndvcmtlckxpbWl0ID0gNDtcblx0XHR0aGlzLndvcmtlclBvb2wgPSBbXTtcblx0XHR0aGlzLndvcmtlck5leHRUYXNrSUQgPSAxO1xuXHRcdHRoaXMud29ya2VyU291cmNlVVJMID0gJyc7XG5cblx0XHR0aGlzLmRlZmF1bHRBdHRyaWJ1dGVJRHMgPSB7XG5cdFx0XHRwb3NpdGlvbjogJ1BPU0lUSU9OJyxcblx0XHRcdG5vcm1hbDogJ05PUk1BTCcsXG5cdFx0XHRjb2xvcjogJ0NPTE9SJyxcblx0XHRcdHV2OiAnVEVYX0NPT1JEJ1xuXHRcdH07XG5cdFx0dGhpcy5kZWZhdWx0QXR0cmlidXRlVHlwZXMgPSB7XG5cdFx0XHRwb3NpdGlvbjogJ0Zsb2F0MzJBcnJheScsXG5cdFx0XHRub3JtYWw6ICdGbG9hdDMyQXJyYXknLFxuXHRcdFx0Y29sb3I6ICdGbG9hdDMyQXJyYXknLFxuXHRcdFx0dXY6ICdGbG9hdDMyQXJyYXknXG5cdFx0fTtcblxuXHR9XG5cblx0c2V0RGVjb2RlclBhdGgoIHBhdGggKSB7XG5cblx0XHR0aGlzLmRlY29kZXJQYXRoID0gcGF0aDtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXREZWNvZGVyQ29uZmlnKCBjb25maWcgKSB7XG5cblx0XHR0aGlzLmRlY29kZXJDb25maWcgPSBjb25maWc7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0V29ya2VyTGltaXQoIHdvcmtlckxpbWl0ICkge1xuXG5cdFx0dGhpcy53b3JrZXJMaW1pdCA9IHdvcmtlckxpbWl0O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGxvYWQoIHVybCwgb25Mb2FkLCBvblByb2dyZXNzLCBvbkVycm9yICkge1xuXG5cdFx0Y29uc3QgbG9hZGVyID0gbmV3IEZpbGVMb2FkZXIoIHRoaXMubWFuYWdlciApO1xuXG5cdFx0bG9hZGVyLnNldFBhdGgoIHRoaXMucGF0aCApO1xuXHRcdGxvYWRlci5zZXRSZXNwb25zZVR5cGUoICdhcnJheWJ1ZmZlcicgKTtcblx0XHRsb2FkZXIuc2V0UmVxdWVzdEhlYWRlciggdGhpcy5yZXF1ZXN0SGVhZGVyICk7XG5cdFx0bG9hZGVyLnNldFdpdGhDcmVkZW50aWFscyggdGhpcy53aXRoQ3JlZGVudGlhbHMgKTtcblxuXHRcdGxvYWRlci5sb2FkKCB1cmwsICggYnVmZmVyICkgPT4ge1xuXG5cdFx0XHR0aGlzLnBhcnNlKCBidWZmZXIsIG9uTG9hZCwgb25FcnJvciApO1xuXG5cdFx0fSwgb25Qcm9ncmVzcywgb25FcnJvciApO1xuXG5cdH1cblxuXHRwYXJzZSggYnVmZmVyLCBvbkxvYWQsIG9uRXJyb3IgKSB7XG5cblx0XHR0aGlzLmRlY29kZURyYWNvRmlsZSggYnVmZmVyLCBvbkxvYWQsIG51bGwsIG51bGwsIFNSR0JDb2xvclNwYWNlICkuY2F0Y2goIG9uRXJyb3IgKTtcblxuXHR9XG5cblx0ZGVjb2RlRHJhY29GaWxlKCBidWZmZXIsIGNhbGxiYWNrLCBhdHRyaWJ1dGVJRHMsIGF0dHJpYnV0ZVR5cGVzLCB2ZXJ0ZXhDb2xvclNwYWNlID0gTGluZWFyU1JHQkNvbG9yU3BhY2UgKSB7XG5cblx0XHRjb25zdCB0YXNrQ29uZmlnID0ge1xuXHRcdFx0YXR0cmlidXRlSURzOiBhdHRyaWJ1dGVJRHMgfHwgdGhpcy5kZWZhdWx0QXR0cmlidXRlSURzLFxuXHRcdFx0YXR0cmlidXRlVHlwZXM6IGF0dHJpYnV0ZVR5cGVzIHx8IHRoaXMuZGVmYXVsdEF0dHJpYnV0ZVR5cGVzLFxuXHRcdFx0dXNlVW5pcXVlSURzOiAhISBhdHRyaWJ1dGVJRHMsXG5cdFx0XHR2ZXJ0ZXhDb2xvclNwYWNlOiB2ZXJ0ZXhDb2xvclNwYWNlLFxuXHRcdH07XG5cblx0XHRyZXR1cm4gdGhpcy5kZWNvZGVHZW9tZXRyeSggYnVmZmVyLCB0YXNrQ29uZmlnICkudGhlbiggY2FsbGJhY2sgKTtcblxuXHR9XG5cblx0ZGVjb2RlR2VvbWV0cnkoIGJ1ZmZlciwgdGFza0NvbmZpZyApIHtcblxuXHRcdGNvbnN0IHRhc2tLZXkgPSBKU09OLnN0cmluZ2lmeSggdGFza0NvbmZpZyApO1xuXG5cdFx0Ly8gQ2hlY2sgZm9yIGFuIGV4aXN0aW5nIHRhc2sgdXNpbmcgdGhpcyBidWZmZXIuIEEgdHJhbnNmZXJyZWQgYnVmZmVyIGNhbm5vdCBiZSB0cmFuc2ZlcnJlZFxuXHRcdC8vIGFnYWluIGZyb20gdGhpcyB0aHJlYWQuXG5cdFx0aWYgKCBfdGFza0NhY2hlLmhhcyggYnVmZmVyICkgKSB7XG5cblx0XHRcdGNvbnN0IGNhY2hlZFRhc2sgPSBfdGFza0NhY2hlLmdldCggYnVmZmVyICk7XG5cblx0XHRcdGlmICggY2FjaGVkVGFzay5rZXkgPT09IHRhc2tLZXkgKSB7XG5cblx0XHRcdFx0cmV0dXJuIGNhY2hlZFRhc2sucHJvbWlzZTtcblxuXHRcdFx0fSBlbHNlIGlmICggYnVmZmVyLmJ5dGVMZW5ndGggPT09IDAgKSB7XG5cblx0XHRcdFx0Ly8gVGVjaG5pY2FsbHksIGl0IHdvdWxkIGJlIHBvc3NpYmxlIHRvIHdhaXQgZm9yIHRoZSBwcmV2aW91cyB0YXNrIHRvIGNvbXBsZXRlLFxuXHRcdFx0XHQvLyB0cmFuc2ZlciB0aGUgYnVmZmVyIGJhY2ssIGFuZCBkZWNvZGUgYWdhaW4gd2l0aCB0aGUgc2Vjb25kIGNvbmZpZ3VyYXRpb24uIFRoYXRcblx0XHRcdFx0Ly8gaXMgY29tcGxleCwgYW5kIEkgZG9uJ3Qga25vdyBvZiBhbnkgcmVhc29uIHRvIGRlY29kZSBhIERyYWNvIGJ1ZmZlciB0d2ljZSBpblxuXHRcdFx0XHQvLyBkaWZmZXJlbnQgd2F5cywgc28gdGhpcyBpcyBsZWZ0IHVuaW1wbGVtZW50ZWQuXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblxuXHRcdFx0XHRcdCdUSFJFRS5EUkFDT0xvYWRlcjogVW5hYmxlIHRvIHJlLWRlY29kZSBhIGJ1ZmZlciB3aXRoIGRpZmZlcmVudCAnICtcblx0XHRcdFx0XHQnc2V0dGluZ3MuIEJ1ZmZlciBoYXMgYWxyZWFkeSBiZWVuIHRyYW5zZmVycmVkLidcblxuXHRcdFx0XHQpO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHQvL1xuXG5cdFx0bGV0IHdvcmtlcjtcblx0XHRjb25zdCB0YXNrSUQgPSB0aGlzLndvcmtlck5leHRUYXNrSUQgKys7XG5cdFx0Y29uc3QgdGFza0Nvc3QgPSBidWZmZXIuYnl0ZUxlbmd0aDtcblxuXHRcdC8vIE9idGFpbiBhIHdvcmtlciBhbmQgYXNzaWduIGEgdGFzaywgYW5kIGNvbnN0cnVjdCBhIGdlb21ldHJ5IGluc3RhbmNlXG5cdFx0Ly8gd2hlbiB0aGUgdGFzayBjb21wbGV0ZXMuXG5cdFx0Y29uc3QgZ2VvbWV0cnlQZW5kaW5nID0gdGhpcy5fZ2V0V29ya2VyKCB0YXNrSUQsIHRhc2tDb3N0IClcblx0XHRcdC50aGVuKCAoIF93b3JrZXIgKSA9PiB7XG5cblx0XHRcdFx0d29ya2VyID0gX3dvcmtlcjtcblxuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuXG5cdFx0XHRcdFx0d29ya2VyLl9jYWxsYmFja3NbIHRhc2tJRCBdID0geyByZXNvbHZlLCByZWplY3QgfTtcblxuXHRcdFx0XHRcdHdvcmtlci5wb3N0TWVzc2FnZSggeyB0eXBlOiAnZGVjb2RlJywgaWQ6IHRhc2tJRCwgdGFza0NvbmZpZywgYnVmZmVyIH0sIFsgYnVmZmVyIF0gKTtcblxuXHRcdFx0XHRcdC8vIHRoaXMuZGVidWcoKTtcblxuXHRcdFx0XHR9ICk7XG5cblx0XHRcdH0gKVxuXHRcdFx0LnRoZW4oICggbWVzc2FnZSApID0+IHRoaXMuX2NyZWF0ZUdlb21ldHJ5KCBtZXNzYWdlLmdlb21ldHJ5ICkgKTtcblxuXHRcdC8vIFJlbW92ZSB0YXNrIGZyb20gdGhlIHRhc2sgbGlzdC5cblx0XHQvLyBOb3RlOiByZXBsYWNlZCAnLmZpbmFsbHkoKScgd2l0aCAnLmNhdGNoKCkudGhlbigpJyBibG9jayAtIGlPUyAxMSBzdXBwb3J0ICgjMTk0MTYpXG5cdFx0Z2VvbWV0cnlQZW5kaW5nXG5cdFx0XHQuY2F0Y2goICgpID0+IHRydWUgKVxuXHRcdFx0LnRoZW4oICgpID0+IHtcblxuXHRcdFx0XHRpZiAoIHdvcmtlciAmJiB0YXNrSUQgKSB7XG5cblx0XHRcdFx0XHR0aGlzLl9yZWxlYXNlVGFzayggd29ya2VyLCB0YXNrSUQgKTtcblxuXHRcdFx0XHRcdC8vIHRoaXMuZGVidWcoKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH0gKTtcblxuXHRcdC8vIENhY2hlIHRoZSB0YXNrIHJlc3VsdC5cblx0XHRfdGFza0NhY2hlLnNldCggYnVmZmVyLCB7XG5cblx0XHRcdGtleTogdGFza0tleSxcblx0XHRcdHByb21pc2U6IGdlb21ldHJ5UGVuZGluZ1xuXG5cdFx0fSApO1xuXG5cdFx0cmV0dXJuIGdlb21ldHJ5UGVuZGluZztcblxuXHR9XG5cblx0X2NyZWF0ZUdlb21ldHJ5KCBnZW9tZXRyeURhdGEgKSB7XG5cblx0XHRjb25zdCBnZW9tZXRyeSA9IG5ldyBCdWZmZXJHZW9tZXRyeSgpO1xuXG5cdFx0aWYgKCBnZW9tZXRyeURhdGEuaW5kZXggKSB7XG5cblx0XHRcdGdlb21ldHJ5LnNldEluZGV4KCBuZXcgQnVmZmVyQXR0cmlidXRlKCBnZW9tZXRyeURhdGEuaW5kZXguYXJyYXksIDEgKSApO1xuXG5cdFx0fVxuXG5cdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgZ2VvbWV0cnlEYXRhLmF0dHJpYnV0ZXMubGVuZ3RoOyBpICsrICkge1xuXG5cdFx0XHRjb25zdCByZXN1bHQgPSBnZW9tZXRyeURhdGEuYXR0cmlidXRlc1sgaSBdO1xuXHRcdFx0Y29uc3QgbmFtZSA9IHJlc3VsdC5uYW1lO1xuXHRcdFx0Y29uc3QgYXJyYXkgPSByZXN1bHQuYXJyYXk7XG5cdFx0XHRjb25zdCBpdGVtU2l6ZSA9IHJlc3VsdC5pdGVtU2l6ZTtcblxuXHRcdFx0Y29uc3QgYXR0cmlidXRlID0gbmV3IEJ1ZmZlckF0dHJpYnV0ZSggYXJyYXksIGl0ZW1TaXplICk7XG5cblx0XHRcdGlmICggbmFtZSA9PT0gJ2NvbG9yJyApIHtcblxuXHRcdFx0XHR0aGlzLl9hc3NpZ25WZXJ0ZXhDb2xvclNwYWNlKCBhdHRyaWJ1dGUsIHJlc3VsdC52ZXJ0ZXhDb2xvclNwYWNlICk7XG5cblx0XHRcdFx0YXR0cmlidXRlLm5vcm1hbGl6ZWQgPSAoIGFycmF5IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkgPT09IGZhbHNlO1xuXG5cdFx0XHR9XG5cblx0XHRcdGdlb21ldHJ5LnNldEF0dHJpYnV0ZSggbmFtZSwgYXR0cmlidXRlICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gZ2VvbWV0cnk7XG5cblx0fVxuXG5cdF9hc3NpZ25WZXJ0ZXhDb2xvclNwYWNlKCBhdHRyaWJ1dGUsIGlucHV0Q29sb3JTcGFjZSApIHtcblxuXHRcdC8vIFdoaWxlIC5kcmMgZmlsZXMgZG8gbm90IHNwZWNpZnkgY29sb3JzcGFjZSwgdGhlIG9ubHkgJ29mZmljaWFsJyB0b29saW5nXG5cdFx0Ly8gaXMgUExZIGFuZCBPQkogY29udmVydGVycywgd2hpY2ggdXNlIHNSR0IuIFdlJ2xsIGFzc3VtZSBzUkdCIHdoZW4gYSAuZHJjXG5cdFx0Ly8gZmlsZSBpcyBwYXNzZWQgaW50byAubG9hZCgpIG9yIC5wYXJzZSgpLiBHTFRGTG9hZGVyIHVzZXMgaW50ZXJuYWwgQVBJc1xuXHRcdC8vIHRvIGRlY29kZSBnZW9tZXRyeSwgYW5kIHZlcnRleCBjb2xvcnMgYXJlIGFscmVhZHkgTGluZWFyLXNSR0IgaW4gdGhlcmUuXG5cblx0XHRpZiAoIGlucHV0Q29sb3JTcGFjZSAhPT0gU1JHQkNvbG9yU3BhY2UgKSByZXR1cm47XG5cblx0XHRjb25zdCBfY29sb3IgPSBuZXcgQ29sb3IoKTtcblxuXHRcdGZvciAoIGxldCBpID0gMCwgaWwgPSBhdHRyaWJ1dGUuY291bnQ7IGkgPCBpbDsgaSArKyApIHtcblxuXHRcdFx0X2NvbG9yLmZyb21CdWZmZXJBdHRyaWJ1dGUoIGF0dHJpYnV0ZSwgaSApLmNvbnZlcnRTUkdCVG9MaW5lYXIoKTtcblx0XHRcdGF0dHJpYnV0ZS5zZXRYWVooIGksIF9jb2xvci5yLCBfY29sb3IuZywgX2NvbG9yLmIgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0X2xvYWRMaWJyYXJ5KCB1cmwsIHJlc3BvbnNlVHlwZSApIHtcblxuXHRcdGNvbnN0IGxvYWRlciA9IG5ldyBGaWxlTG9hZGVyKCB0aGlzLm1hbmFnZXIgKTtcblx0XHRsb2FkZXIuc2V0UGF0aCggdGhpcy5kZWNvZGVyUGF0aCApO1xuXHRcdGxvYWRlci5zZXRSZXNwb25zZVR5cGUoIHJlc3BvbnNlVHlwZSApO1xuXHRcdGxvYWRlci5zZXRXaXRoQ3JlZGVudGlhbHMoIHRoaXMud2l0aENyZWRlbnRpYWxzICk7XG5cblx0XHRyZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuXG5cdFx0XHRsb2FkZXIubG9hZCggdXJsLCByZXNvbHZlLCB1bmRlZmluZWQsIHJlamVjdCApO1xuXG5cdFx0fSApO1xuXG5cdH1cblxuXHRwcmVsb2FkKCkge1xuXG5cdFx0dGhpcy5faW5pdERlY29kZXIoKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRfaW5pdERlY29kZXIoKSB7XG5cblx0XHRpZiAoIHRoaXMuZGVjb2RlclBlbmRpbmcgKSByZXR1cm4gdGhpcy5kZWNvZGVyUGVuZGluZztcblxuXHRcdGNvbnN0IHVzZUpTID0gdHlwZW9mIFdlYkFzc2VtYmx5ICE9PSAnb2JqZWN0JyB8fCB0aGlzLmRlY29kZXJDb25maWcudHlwZSA9PT0gJ2pzJztcblx0XHRjb25zdCBsaWJyYXJpZXNQZW5kaW5nID0gW107XG5cblx0XHRpZiAoIHVzZUpTICkge1xuXG5cdFx0XHRsaWJyYXJpZXNQZW5kaW5nLnB1c2goIHRoaXMuX2xvYWRMaWJyYXJ5KCAnZHJhY29fZGVjb2Rlci5qcycsICd0ZXh0JyApICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRsaWJyYXJpZXNQZW5kaW5nLnB1c2goIHRoaXMuX2xvYWRMaWJyYXJ5KCAnZHJhY29fd2FzbV93cmFwcGVyLmpzJywgJ3RleHQnICkgKTtcblx0XHRcdGxpYnJhcmllc1BlbmRpbmcucHVzaCggdGhpcy5fbG9hZExpYnJhcnkoICdkcmFjb19kZWNvZGVyLndhc20nLCAnYXJyYXlidWZmZXInICkgKTtcblxuXHRcdH1cblxuXHRcdHRoaXMuZGVjb2RlclBlbmRpbmcgPSBQcm9taXNlLmFsbCggbGlicmFyaWVzUGVuZGluZyApXG5cdFx0XHQudGhlbiggKCBsaWJyYXJpZXMgKSA9PiB7XG5cblx0XHRcdFx0Y29uc3QganNDb250ZW50ID0gbGlicmFyaWVzWyAwIF07XG5cblx0XHRcdFx0aWYgKCAhIHVzZUpTICkge1xuXG5cdFx0XHRcdFx0dGhpcy5kZWNvZGVyQ29uZmlnLndhc21CaW5hcnkgPSBsaWJyYXJpZXNbIDEgXTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgZm4gPSBEUkFDT1dvcmtlci50b1N0cmluZygpO1xuXG5cdFx0XHRcdGNvbnN0IGJvZHkgPSBbXG5cdFx0XHRcdFx0Jy8qIGRyYWNvIGRlY29kZXIgKi8nLFxuXHRcdFx0XHRcdGpzQ29udGVudCxcblx0XHRcdFx0XHQnJyxcblx0XHRcdFx0XHQnLyogd29ya2VyICovJyxcblx0XHRcdFx0XHRmbi5zdWJzdHJpbmcoIGZuLmluZGV4T2YoICd7JyApICsgMSwgZm4ubGFzdEluZGV4T2YoICd9JyApIClcblx0XHRcdFx0XS5qb2luKCAnXFxuJyApO1xuXG5cdFx0XHRcdHRoaXMud29ya2VyU291cmNlVVJMID0gVVJMLmNyZWF0ZU9iamVjdFVSTCggbmV3IEJsb2IoIFsgYm9keSBdICkgKTtcblxuXHRcdFx0fSApO1xuXG5cdFx0cmV0dXJuIHRoaXMuZGVjb2RlclBlbmRpbmc7XG5cblx0fVxuXG5cdF9nZXRXb3JrZXIoIHRhc2tJRCwgdGFza0Nvc3QgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5faW5pdERlY29kZXIoKS50aGVuKCAoKSA9PiB7XG5cblx0XHRcdGlmICggdGhpcy53b3JrZXJQb29sLmxlbmd0aCA8IHRoaXMud29ya2VyTGltaXQgKSB7XG5cblx0XHRcdFx0Y29uc3Qgd29ya2VyID0gbmV3IFdvcmtlciggdGhpcy53b3JrZXJTb3VyY2VVUkwgKTtcblxuXHRcdFx0XHR3b3JrZXIuX2NhbGxiYWNrcyA9IHt9O1xuXHRcdFx0XHR3b3JrZXIuX3Rhc2tDb3N0cyA9IHt9O1xuXHRcdFx0XHR3b3JrZXIuX3Rhc2tMb2FkID0gMDtcblxuXHRcdFx0XHR3b3JrZXIucG9zdE1lc3NhZ2UoIHsgdHlwZTogJ2luaXQnLCBkZWNvZGVyQ29uZmlnOiB0aGlzLmRlY29kZXJDb25maWcgfSApO1xuXG5cdFx0XHRcdHdvcmtlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoIGUgKSB7XG5cblx0XHRcdFx0XHRjb25zdCBtZXNzYWdlID0gZS5kYXRhO1xuXG5cdFx0XHRcdFx0c3dpdGNoICggbWVzc2FnZS50eXBlICkge1xuXG5cdFx0XHRcdFx0XHRjYXNlICdkZWNvZGUnOlxuXHRcdFx0XHRcdFx0XHR3b3JrZXIuX2NhbGxiYWNrc1sgbWVzc2FnZS5pZCBdLnJlc29sdmUoIG1lc3NhZ2UgKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdGNhc2UgJ2Vycm9yJzpcblx0XHRcdFx0XHRcdFx0d29ya2VyLl9jYWxsYmFja3NbIG1lc3NhZ2UuaWQgXS5yZWplY3QoIG1lc3NhZ2UgKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoICdUSFJFRS5EUkFDT0xvYWRlcjogVW5leHBlY3RlZCBtZXNzYWdlLCBcIicgKyBtZXNzYWdlLnR5cGUgKyAnXCInICk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fTtcblxuXHRcdFx0XHR0aGlzLndvcmtlclBvb2wucHVzaCggd29ya2VyICk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0dGhpcy53b3JrZXJQb29sLnNvcnQoIGZ1bmN0aW9uICggYSwgYiApIHtcblxuXHRcdFx0XHRcdHJldHVybiBhLl90YXNrTG9hZCA+IGIuX3Rhc2tMb2FkID8gLSAxIDogMTtcblxuXHRcdFx0XHR9ICk7XG5cblx0XHRcdH1cblxuXHRcdFx0Y29uc3Qgd29ya2VyID0gdGhpcy53b3JrZXJQb29sWyB0aGlzLndvcmtlclBvb2wubGVuZ3RoIC0gMSBdO1xuXHRcdFx0d29ya2VyLl90YXNrQ29zdHNbIHRhc2tJRCBdID0gdGFza0Nvc3Q7XG5cdFx0XHR3b3JrZXIuX3Rhc2tMb2FkICs9IHRhc2tDb3N0O1xuXHRcdFx0cmV0dXJuIHdvcmtlcjtcblxuXHRcdH0gKTtcblxuXHR9XG5cblx0X3JlbGVhc2VUYXNrKCB3b3JrZXIsIHRhc2tJRCApIHtcblxuXHRcdHdvcmtlci5fdGFza0xvYWQgLT0gd29ya2VyLl90YXNrQ29zdHNbIHRhc2tJRCBdO1xuXHRcdGRlbGV0ZSB3b3JrZXIuX2NhbGxiYWNrc1sgdGFza0lEIF07XG5cdFx0ZGVsZXRlIHdvcmtlci5fdGFza0Nvc3RzWyB0YXNrSUQgXTtcblxuXHR9XG5cblx0ZGVidWcoKSB7XG5cblx0XHRjb25zb2xlLmxvZyggJ1Rhc2sgbG9hZDogJywgdGhpcy53b3JrZXJQb29sLm1hcCggKCB3b3JrZXIgKSA9PiB3b3JrZXIuX3Rhc2tMb2FkICkgKTtcblxuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblxuXHRcdGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMud29ya2VyUG9vbC5sZW5ndGg7ICsrIGkgKSB7XG5cblx0XHRcdHRoaXMud29ya2VyUG9vbFsgaSBdLnRlcm1pbmF0ZSgpO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy53b3JrZXJQb29sLmxlbmd0aCA9IDA7XG5cblx0XHRpZiAoIHRoaXMud29ya2VyU291cmNlVVJMICE9PSAnJyApIHtcblxuXHRcdFx0VVJMLnJldm9rZU9iamVjdFVSTCggdGhpcy53b3JrZXJTb3VyY2VVUkwgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxufVxuXG4vKiBXRUIgV09SS0VSICovXG5cbmZ1bmN0aW9uIERSQUNPV29ya2VyKCkge1xuXG5cdGxldCBkZWNvZGVyQ29uZmlnO1xuXHRsZXQgZGVjb2RlclBlbmRpbmc7XG5cblx0b25tZXNzYWdlID0gZnVuY3Rpb24gKCBlICkge1xuXG5cdFx0Y29uc3QgbWVzc2FnZSA9IGUuZGF0YTtcblxuXHRcdHN3aXRjaCAoIG1lc3NhZ2UudHlwZSApIHtcblxuXHRcdFx0Y2FzZSAnaW5pdCc6XG5cdFx0XHRcdGRlY29kZXJDb25maWcgPSBtZXNzYWdlLmRlY29kZXJDb25maWc7XG5cdFx0XHRcdGRlY29kZXJQZW5kaW5nID0gbmV3IFByb21pc2UoIGZ1bmN0aW9uICggcmVzb2x2ZS8qLCByZWplY3QqLyApIHtcblxuXHRcdFx0XHRcdGRlY29kZXJDb25maWcub25Nb2R1bGVMb2FkZWQgPSBmdW5jdGlvbiAoIGRyYWNvICkge1xuXG5cdFx0XHRcdFx0XHQvLyBNb2R1bGUgaXMgUHJvbWlzZS1saWtlLiBXcmFwIGJlZm9yZSByZXNvbHZpbmcgdG8gYXZvaWQgbG9vcC5cblx0XHRcdFx0XHRcdHJlc29sdmUoIHsgZHJhY286IGRyYWNvIH0gKTtcblxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHREcmFjb0RlY29kZXJNb2R1bGUoIGRlY29kZXJDb25maWcgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cdFx0XHRcdH0gKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2RlY29kZSc6XG5cdFx0XHRcdGNvbnN0IGJ1ZmZlciA9IG1lc3NhZ2UuYnVmZmVyO1xuXHRcdFx0XHRjb25zdCB0YXNrQ29uZmlnID0gbWVzc2FnZS50YXNrQ29uZmlnO1xuXHRcdFx0XHRkZWNvZGVyUGVuZGluZy50aGVuKCAoIG1vZHVsZSApID0+IHtcblxuXHRcdFx0XHRcdGNvbnN0IGRyYWNvID0gbW9kdWxlLmRyYWNvO1xuXHRcdFx0XHRcdGNvbnN0IGRlY29kZXIgPSBuZXcgZHJhY28uRGVjb2RlcigpO1xuXG5cdFx0XHRcdFx0dHJ5IHtcblxuXHRcdFx0XHRcdFx0Y29uc3QgZ2VvbWV0cnkgPSBkZWNvZGVHZW9tZXRyeSggZHJhY28sIGRlY29kZXIsIG5ldyBJbnQ4QXJyYXkoIGJ1ZmZlciApLCB0YXNrQ29uZmlnICk7XG5cblx0XHRcdFx0XHRcdGNvbnN0IGJ1ZmZlcnMgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzLm1hcCggKCBhdHRyICkgPT4gYXR0ci5hcnJheS5idWZmZXIgKTtcblxuXHRcdFx0XHRcdFx0aWYgKCBnZW9tZXRyeS5pbmRleCApIGJ1ZmZlcnMucHVzaCggZ2VvbWV0cnkuaW5kZXguYXJyYXkuYnVmZmVyICk7XG5cblx0XHRcdFx0XHRcdHNlbGYucG9zdE1lc3NhZ2UoIHsgdHlwZTogJ2RlY29kZScsIGlkOiBtZXNzYWdlLmlkLCBnZW9tZXRyeSB9LCBidWZmZXJzICk7XG5cblx0XHRcdFx0XHR9IGNhdGNoICggZXJyb3IgKSB7XG5cblx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoIGVycm9yICk7XG5cblx0XHRcdFx0XHRcdHNlbGYucG9zdE1lc3NhZ2UoIHsgdHlwZTogJ2Vycm9yJywgaWQ6IG1lc3NhZ2UuaWQsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0gKTtcblxuXHRcdFx0XHRcdH0gZmluYWxseSB7XG5cblx0XHRcdFx0XHRcdGRyYWNvLmRlc3Ryb3koIGRlY29kZXIgKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9ICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0fVxuXG5cdH07XG5cblx0ZnVuY3Rpb24gZGVjb2RlR2VvbWV0cnkoIGRyYWNvLCBkZWNvZGVyLCBhcnJheSwgdGFza0NvbmZpZyApIHtcblxuXHRcdGNvbnN0IGF0dHJpYnV0ZUlEcyA9IHRhc2tDb25maWcuYXR0cmlidXRlSURzO1xuXHRcdGNvbnN0IGF0dHJpYnV0ZVR5cGVzID0gdGFza0NvbmZpZy5hdHRyaWJ1dGVUeXBlcztcblxuXHRcdGxldCBkcmFjb0dlb21ldHJ5O1xuXHRcdGxldCBkZWNvZGluZ1N0YXR1cztcblxuXHRcdGNvbnN0IGdlb21ldHJ5VHlwZSA9IGRlY29kZXIuR2V0RW5jb2RlZEdlb21ldHJ5VHlwZSggYXJyYXkgKTtcblxuXHRcdGlmICggZ2VvbWV0cnlUeXBlID09PSBkcmFjby5UUklBTkdVTEFSX01FU0ggKSB7XG5cblx0XHRcdGRyYWNvR2VvbWV0cnkgPSBuZXcgZHJhY28uTWVzaCgpO1xuXHRcdFx0ZGVjb2RpbmdTdGF0dXMgPSBkZWNvZGVyLkRlY29kZUFycmF5VG9NZXNoKCBhcnJheSwgYXJyYXkuYnl0ZUxlbmd0aCwgZHJhY29HZW9tZXRyeSApO1xuXG5cdFx0fSBlbHNlIGlmICggZ2VvbWV0cnlUeXBlID09PSBkcmFjby5QT0lOVF9DTE9VRCApIHtcblxuXHRcdFx0ZHJhY29HZW9tZXRyeSA9IG5ldyBkcmFjby5Qb2ludENsb3VkKCk7XG5cdFx0XHRkZWNvZGluZ1N0YXR1cyA9IGRlY29kZXIuRGVjb2RlQXJyYXlUb1BvaW50Q2xvdWQoIGFycmF5LCBhcnJheS5ieXRlTGVuZ3RoLCBkcmFjb0dlb21ldHJ5ICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoICdUSFJFRS5EUkFDT0xvYWRlcjogVW5leHBlY3RlZCBnZW9tZXRyeSB0eXBlLicgKTtcblxuXHRcdH1cblxuXHRcdGlmICggISBkZWNvZGluZ1N0YXR1cy5vaygpIHx8IGRyYWNvR2VvbWV0cnkucHRyID09PSAwICkge1xuXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoICdUSFJFRS5EUkFDT0xvYWRlcjogRGVjb2RpbmcgZmFpbGVkOiAnICsgZGVjb2RpbmdTdGF0dXMuZXJyb3JfbXNnKCkgKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IGdlb21ldHJ5ID0geyBpbmRleDogbnVsbCwgYXR0cmlidXRlczogW10gfTtcblxuXHRcdC8vIEdhdGhlciBhbGwgdmVydGV4IGF0dHJpYnV0ZXMuXG5cdFx0Zm9yICggY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVJRHMgKSB7XG5cblx0XHRcdGNvbnN0IGF0dHJpYnV0ZVR5cGUgPSBzZWxmWyBhdHRyaWJ1dGVUeXBlc1sgYXR0cmlidXRlTmFtZSBdIF07XG5cblx0XHRcdGxldCBhdHRyaWJ1dGU7XG5cdFx0XHRsZXQgYXR0cmlidXRlSUQ7XG5cblx0XHRcdC8vIEEgRHJhY28gZmlsZSBtYXkgYmUgY3JlYXRlZCB3aXRoIGRlZmF1bHQgdmVydGV4IGF0dHJpYnV0ZXMsIHdob3NlIGF0dHJpYnV0ZSBJRHNcblx0XHRcdC8vIGFyZSBtYXBwZWQgMToxIGZyb20gdGhlaXIgc2VtYW50aWMgbmFtZSAoUE9TSVRJT04sIE5PUk1BTCwgLi4uKS4gQWx0ZXJuYXRpdmVseSxcblx0XHRcdC8vIGEgRHJhY28gZmlsZSBtYXkgY29udGFpbiBhIGN1c3RvbSBzZXQgb2YgYXR0cmlidXRlcywgaWRlbnRpZmllZCBieSBrbm93biB1bmlxdWVcblx0XHRcdC8vIElEcy4gZ2xURiBmaWxlcyBhbHdheXMgZG8gdGhlIGxhdHRlciwgYW5kIGAuZHJjYCBmaWxlcyB0eXBpY2FsbHkgZG8gdGhlIGZvcm1lci5cblx0XHRcdGlmICggdGFza0NvbmZpZy51c2VVbmlxdWVJRHMgKSB7XG5cblx0XHRcdFx0YXR0cmlidXRlSUQgPSBhdHRyaWJ1dGVJRHNbIGF0dHJpYnV0ZU5hbWUgXTtcblx0XHRcdFx0YXR0cmlidXRlID0gZGVjb2Rlci5HZXRBdHRyaWJ1dGVCeVVuaXF1ZUlkKCBkcmFjb0dlb21ldHJ5LCBhdHRyaWJ1dGVJRCApO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGF0dHJpYnV0ZUlEID0gZGVjb2Rlci5HZXRBdHRyaWJ1dGVJZCggZHJhY29HZW9tZXRyeSwgZHJhY29bIGF0dHJpYnV0ZUlEc1sgYXR0cmlidXRlTmFtZSBdIF0gKTtcblxuXHRcdFx0XHRpZiAoIGF0dHJpYnV0ZUlEID09PSAtIDEgKSBjb250aW51ZTtcblxuXHRcdFx0XHRhdHRyaWJ1dGUgPSBkZWNvZGVyLkdldEF0dHJpYnV0ZSggZHJhY29HZW9tZXRyeSwgYXR0cmlidXRlSUQgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBhdHRyaWJ1dGVSZXN1bHQgPSBkZWNvZGVBdHRyaWJ1dGUoIGRyYWNvLCBkZWNvZGVyLCBkcmFjb0dlb21ldHJ5LCBhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVUeXBlLCBhdHRyaWJ1dGUgKTtcblxuXHRcdFx0aWYgKCBhdHRyaWJ1dGVOYW1lID09PSAnY29sb3InICkge1xuXG5cdFx0XHRcdGF0dHJpYnV0ZVJlc3VsdC52ZXJ0ZXhDb2xvclNwYWNlID0gdGFza0NvbmZpZy52ZXJ0ZXhDb2xvclNwYWNlO1xuXG5cdFx0XHR9XG5cblx0XHRcdGdlb21ldHJ5LmF0dHJpYnV0ZXMucHVzaCggYXR0cmlidXRlUmVzdWx0ICk7XG5cblx0XHR9XG5cblx0XHQvLyBBZGQgaW5kZXguXG5cdFx0aWYgKCBnZW9tZXRyeVR5cGUgPT09IGRyYWNvLlRSSUFOR1VMQVJfTUVTSCApIHtcblxuXHRcdFx0Z2VvbWV0cnkuaW5kZXggPSBkZWNvZGVJbmRleCggZHJhY28sIGRlY29kZXIsIGRyYWNvR2VvbWV0cnkgKTtcblxuXHRcdH1cblxuXHRcdGRyYWNvLmRlc3Ryb3koIGRyYWNvR2VvbWV0cnkgKTtcblxuXHRcdHJldHVybiBnZW9tZXRyeTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gZGVjb2RlSW5kZXgoIGRyYWNvLCBkZWNvZGVyLCBkcmFjb0dlb21ldHJ5ICkge1xuXG5cdFx0Y29uc3QgbnVtRmFjZXMgPSBkcmFjb0dlb21ldHJ5Lm51bV9mYWNlcygpO1xuXHRcdGNvbnN0IG51bUluZGljZXMgPSBudW1GYWNlcyAqIDM7XG5cdFx0Y29uc3QgYnl0ZUxlbmd0aCA9IG51bUluZGljZXMgKiA0O1xuXG5cdFx0Y29uc3QgcHRyID0gZHJhY28uX21hbGxvYyggYnl0ZUxlbmd0aCApO1xuXHRcdGRlY29kZXIuR2V0VHJpYW5nbGVzVUludDMyQXJyYXkoIGRyYWNvR2VvbWV0cnksIGJ5dGVMZW5ndGgsIHB0ciApO1xuXHRcdGNvbnN0IGluZGV4ID0gbmV3IFVpbnQzMkFycmF5KCBkcmFjby5IRUFQRjMyLmJ1ZmZlciwgcHRyLCBudW1JbmRpY2VzICkuc2xpY2UoKTtcblx0XHRkcmFjby5fZnJlZSggcHRyICk7XG5cblx0XHRyZXR1cm4geyBhcnJheTogaW5kZXgsIGl0ZW1TaXplOiAxIH07XG5cblx0fVxuXG5cdGZ1bmN0aW9uIGRlY29kZUF0dHJpYnV0ZSggZHJhY28sIGRlY29kZXIsIGRyYWNvR2VvbWV0cnksIGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZVR5cGUsIGF0dHJpYnV0ZSApIHtcblxuXHRcdGNvbnN0IG51bUNvbXBvbmVudHMgPSBhdHRyaWJ1dGUubnVtX2NvbXBvbmVudHMoKTtcblx0XHRjb25zdCBudW1Qb2ludHMgPSBkcmFjb0dlb21ldHJ5Lm51bV9wb2ludHMoKTtcblx0XHRjb25zdCBudW1WYWx1ZXMgPSBudW1Qb2ludHMgKiBudW1Db21wb25lbnRzO1xuXHRcdGNvbnN0IGJ5dGVMZW5ndGggPSBudW1WYWx1ZXMgKiBhdHRyaWJ1dGVUeXBlLkJZVEVTX1BFUl9FTEVNRU5UO1xuXHRcdGNvbnN0IGRhdGFUeXBlID0gZ2V0RHJhY29EYXRhVHlwZSggZHJhY28sIGF0dHJpYnV0ZVR5cGUgKTtcblxuXHRcdGNvbnN0IHB0ciA9IGRyYWNvLl9tYWxsb2MoIGJ5dGVMZW5ndGggKTtcblx0XHRkZWNvZGVyLkdldEF0dHJpYnV0ZURhdGFBcnJheUZvckFsbFBvaW50cyggZHJhY29HZW9tZXRyeSwgYXR0cmlidXRlLCBkYXRhVHlwZSwgYnl0ZUxlbmd0aCwgcHRyICk7XG5cdFx0Y29uc3QgYXJyYXkgPSBuZXcgYXR0cmlidXRlVHlwZSggZHJhY28uSEVBUEYzMi5idWZmZXIsIHB0ciwgbnVtVmFsdWVzICkuc2xpY2UoKTtcblx0XHRkcmFjby5fZnJlZSggcHRyICk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0bmFtZTogYXR0cmlidXRlTmFtZSxcblx0XHRcdGFycmF5OiBhcnJheSxcblx0XHRcdGl0ZW1TaXplOiBudW1Db21wb25lbnRzXG5cdFx0fTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0RHJhY29EYXRhVHlwZSggZHJhY28sIGF0dHJpYnV0ZVR5cGUgKSB7XG5cblx0XHRzd2l0Y2ggKCBhdHRyaWJ1dGVUeXBlICkge1xuXG5cdFx0XHRjYXNlIEZsb2F0MzJBcnJheTogcmV0dXJuIGRyYWNvLkRUX0ZMT0FUMzI7XG5cdFx0XHRjYXNlIEludDhBcnJheTogcmV0dXJuIGRyYWNvLkRUX0lOVDg7XG5cdFx0XHRjYXNlIEludDE2QXJyYXk6IHJldHVybiBkcmFjby5EVF9JTlQxNjtcblx0XHRcdGNhc2UgSW50MzJBcnJheTogcmV0dXJuIGRyYWNvLkRUX0lOVDMyO1xuXHRcdFx0Y2FzZSBVaW50OEFycmF5OiByZXR1cm4gZHJhY28uRFRfVUlOVDg7XG5cdFx0XHRjYXNlIFVpbnQxNkFycmF5OiByZXR1cm4gZHJhY28uRFRfVUlOVDE2O1xuXHRcdFx0Y2FzZSBVaW50MzJBcnJheTogcmV0dXJuIGRyYWNvLkRUX1VJTlQzMjtcblxuXHRcdH1cblxuXHR9XG5cbn1cblxuZXhwb3J0IHsgRFJBQ09Mb2FkZXIgfTtcbiJdLCJuYW1lcyI6WyJNYXRoVXRpbHMuY2xhbXAiLCJfcXVhdGVybmlvbiIsIl92ZWN0b3IiLCJfYm94IiwiX3YxIiwiX3YyIiwiX20xIiwiTWF0aFV0aWxzLmdlbmVyYXRlVVVJRCJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztBQU9oaEQ7QUFDQTtBQUNBLFNBQVMsWUFBWSxHQUFHO0FBQ3hCO0FBQ0EsQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQztBQUMzQyxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQzNDLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDM0MsQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQztBQUMzQyxDQUFDLE1BQU0sSUFBSSxHQUFHLElBQUksRUFBRSxFQUFFLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEdBQUcsR0FBRztBQUNsSCxHQUFHLElBQUksRUFBRSxFQUFFLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLEVBQUUsR0FBRyxHQUFHO0FBQ3BILEdBQUcsSUFBSSxFQUFFLEVBQUUsR0FBRyxJQUFJLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksRUFBRTtBQUM5RyxHQUFHLElBQUksRUFBRSxFQUFFLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUM7QUFDbEc7QUFDQTtBQUNBLENBQUMsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDM0I7QUFDQSxDQUFDO0FBQ0Q7QUFDQSxTQUFTLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRztBQUNsQztBQUNBLENBQUMsT0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO0FBQ2hEO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFNBQVMsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDakM7QUFDQSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM5QjtBQUNBLENBQUM7QUF1QkQ7QUFDQTtBQUNBLFNBQVMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3pCO0FBQ0EsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QjtBQUNBLENBQUM7QUFrS0Q7QUFDQSxTQUFTLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxHQUFHO0FBQ3JDO0FBQ0EsQ0FBQyxTQUFTLEtBQUssQ0FBQyxXQUFXO0FBQzNCO0FBQ0EsRUFBRSxLQUFLLFlBQVk7QUFDbkI7QUFDQSxHQUFHLE9BQU8sS0FBSyxDQUFDO0FBQ2hCO0FBQ0EsRUFBRSxLQUFLLFdBQVc7QUFDbEI7QUFDQSxHQUFHLE9BQU8sS0FBSyxHQUFHLFlBQVksQ0FBQztBQUMvQjtBQUNBLEVBQUUsS0FBSyxXQUFXO0FBQ2xCO0FBQ0EsR0FBRyxPQUFPLEtBQUssR0FBRyxPQUFPLENBQUM7QUFDMUI7QUFDQSxFQUFFLEtBQUssVUFBVTtBQUNqQjtBQUNBLEdBQUcsT0FBTyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ3hCO0FBQ0EsRUFBRSxLQUFLLFVBQVU7QUFDakI7QUFDQSxHQUFHLE9BQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEdBQUcsWUFBWSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDbEQ7QUFDQSxFQUFFLEtBQUssVUFBVTtBQUNqQjtBQUNBLEdBQUcsT0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssR0FBRyxPQUFPLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM3QztBQUNBLEVBQUUsS0FBSyxTQUFTO0FBQ2hCO0FBQ0EsR0FBRyxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxHQUFHLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzNDO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsR0FBRyxNQUFNLElBQUksS0FBSyxFQUFFLHlCQUF5QixFQUFFLENBQUM7QUFDaEQ7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDO0FBQ0Q7QUFDQSxTQUFTLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxHQUFHO0FBQ25DO0FBQ0EsQ0FBQyxTQUFTLEtBQUssQ0FBQyxXQUFXO0FBQzNCO0FBQ0EsRUFBRSxLQUFLLFlBQVk7QUFDbkI7QUFDQSxHQUFHLE9BQU8sS0FBSyxDQUFDO0FBQ2hCO0FBQ0EsRUFBRSxLQUFLLFdBQVc7QUFDbEI7QUFDQSxHQUFHLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUcsWUFBWSxFQUFFLENBQUM7QUFDN0M7QUFDQSxFQUFFLEtBQUssV0FBVztBQUNsQjtBQUNBLEdBQUcsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxPQUFPLEVBQUUsQ0FBQztBQUN4QztBQUNBLEVBQUUsS0FBSyxVQUFVO0FBQ2pCO0FBQ0EsR0FBRyxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxHQUFHLEtBQUssRUFBRSxDQUFDO0FBQ3RDO0FBQ0EsRUFBRSxLQUFLLFVBQVU7QUFDakI7QUFDQSxHQUFHLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUcsWUFBWSxFQUFFLENBQUM7QUFDN0M7QUFDQSxFQUFFLEtBQUssVUFBVTtBQUNqQjtBQUNBLEdBQUcsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxPQUFPLEVBQUUsQ0FBQztBQUN4QztBQUNBLEVBQUUsS0FBSyxTQUFTO0FBQ2hCO0FBQ0EsR0FBRyxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxHQUFHLEtBQUssRUFBRSxDQUFDO0FBQ3RDO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsR0FBRyxNQUFNLElBQUksS0FBSyxFQUFFLHlCQUF5QixFQUFFLENBQUM7QUFDaEQ7QUFDQSxFQUFFO0FBQ0Y7QUFDQTs7QUNqVEEsTUFBTSxVQUFVLENBQUM7QUFDakI7QUFDQSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHO0FBQzNDO0FBQ0EsRUFBRSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztBQUMzQjtBQUNBLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDZCxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNkLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxTQUFTLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxHQUFHO0FBQzNFO0FBQ0E7QUFDQTtBQUNBLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUU7QUFDakMsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUU7QUFDOUIsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUU7QUFDOUIsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMvQjtBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUU7QUFDbkMsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUU7QUFDOUIsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUU7QUFDOUIsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMvQjtBQUNBLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO0FBQ2pCO0FBQ0EsR0FBRyxHQUFHLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM3QixHQUFHLEdBQUcsRUFBRSxTQUFTLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzdCLEdBQUcsR0FBRyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDN0IsR0FBRyxHQUFHLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM3QixHQUFHLE9BQU87QUFDVjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO0FBQ2pCO0FBQ0EsR0FBRyxHQUFHLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM3QixHQUFHLEdBQUcsRUFBRSxTQUFTLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzdCLEdBQUcsR0FBRyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDN0IsR0FBRyxHQUFHLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM3QixHQUFHLE9BQU87QUFDVjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHO0FBQzFEO0FBQ0EsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLEdBQUcsTUFBTSxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDcEQsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUU7QUFDaEMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDM0I7QUFDQTtBQUNBLEdBQUcsS0FBSyxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNsQztBQUNBLElBQUksTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7QUFDbkMsS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ3hDO0FBQ0EsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO0FBQ2xDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUNsQztBQUNBLElBQUk7QUFDSjtBQUNBLEdBQUcsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN4QjtBQUNBLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztBQUMzQixHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDM0IsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQzNCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztBQUMzQjtBQUNBO0FBQ0EsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHO0FBQ3RCO0FBQ0EsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDckU7QUFDQSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWixJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWixJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWixJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWjtBQUNBLElBQUk7QUFDSjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUN4QixFQUFFLEdBQUcsRUFBRSxTQUFTLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzVCLEVBQUUsR0FBRyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDNUIsRUFBRSxHQUFHLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM1QjtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyx1QkFBdUIsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsR0FBRztBQUN0RjtBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDO0FBQ2hDLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNwQyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksRUFBRSxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDcEMsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLEVBQUUsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ3BDO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDaEMsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLEVBQUUsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ3BDLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNwQyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksRUFBRSxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDcEM7QUFDQSxFQUFFLEdBQUcsRUFB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QUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDMUI7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDMUIsRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQzFCLEVBQUUsTUFBTSxFQUFFLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMxQjtBQUNBLEVBQUUsU0FBUyxLQUFLO0FBQ2hCO0FBQ0EsR0FBRyxLQUFLLEtBQUs7QUFDYixJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxNQUFNO0FBQ1Y7QUFDQSxHQUFHLEtBQUssS0FBSztBQUNiLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLE1BQU07QUFDVjtBQUNBLEdBQUcsS0FBSyxLQUFLO0FBQ2IsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksTUFBTTtBQUNWO0FBQ0EsR0FBRyxLQUFLLEtBQUs7QUFDYixJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxNQUFNO0FBQ1Y7QUFDQSxHQUFHLEtBQUssS0FBSztBQUNiLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLE1BQU07QUFDVjtBQUNBLEdBQUcsS0FBSyxLQUFLO0FBQ2IsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksTUFBTTtBQUNWO0FBQ0EsR0FBRztBQUNILElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxrRUFBa0UsR0FBRyxLQUFLLEVBQUUsQ0FBQztBQUMvRjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsS0FBSyxNQUFNLEtBQUssS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQ25EO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsS0FBSyxHQUFHO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLE1BQU0sU0FBUyxHQUFHLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDekQ7QUFDQSxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QixFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNsQztBQUNBLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDM0I7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLHFCQUFxQixFQUFFLENBQUMsR0FBRztBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUTtBQUN2QjtBQUNBLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzlDLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzlDLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFO0FBQy9DO0FBQ0EsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDM0I7QUFDQSxFQUFFLEtBQUssS0FBSyxHQUFHLENBQUMsR0FBRztBQUNuQjtBQUNBLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQzVDO0FBQ0EsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7QUFDdEIsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0I7QUFDQSxHQUFHLE1BQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdkM7QUFDQSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ3REO0FBQ0EsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7QUFDdEIsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0I7QUFDQSxHQUFHLE1BQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQzFCO0FBQ0EsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUN0RDtBQUNBLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQy9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQy9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQy9CO0FBQ0EsR0FBRyxNQUFNO0FBQ1Q7QUFDQSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ3REO0FBQ0EsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxH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LEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzFELEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzFELEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzFELEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzFEO0FBQ0EsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUMzQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUc7QUFDaEI7QUFDQSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLElBQUksQ0FBQztBQUM3QixFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDeEM7QUFDQSxFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDM0Q7QUFDQTtBQUNBO0FBQ0EsRUFBRSxJQUFJLFlBQVksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FB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QUcsRUFBRSxFQUFFLEVBQUU7QUFDM0IsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDMUIsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDMUIsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDM0IsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE1BQU0sRUFBRSxVQUFVLEdBQUc7QUFDdEI7QUFDQSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFLFFBQVEsVUFBVSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sVUFBVSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sVUFBVSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDMUk7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLENBQUMsR0FBRztBQUNoQztBQUNBLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDNUIsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDaEMsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDaEMsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDaEM7QUFDQSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQzNCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxPQUFPLEVBQUUsS0FBSyxHQUFHLEVBQUUsRUFB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QyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRztBQUNoQjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZCxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2QsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNkO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNwQjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUN6QjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwQixFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEIsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHO0FBQ1Y7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRztBQUNoQjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZCxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2QsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNkO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNwQjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHO0FBQ2Y7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsY0FBYyxFQUFFLE1BQU0sR0FBRztBQUMxQjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUM7QUFDbkIsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztBQUNuQixFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDO0FBQ25CO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUN6QjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxVQUFVLEVBQUUsS0FBSyxHQUFHO0FBQ3JCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQyxlQUFlLEVBQUVDLGFBQVcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztBQUNuRTtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxLQUFLLEdBQUc7QUFDL0I7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLGVBQWUsRUFBRUEsYUFBVyxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO0FBQzdFO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHO0FBQ25CO0FBQ0EsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUN2QjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNoRCxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDaEQsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2hEO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEdBQUc7QUFDeEI7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUM1QztBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRztBQUNuQjtBQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMzQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDdkI7QUFDQSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUNwRTtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDbEUsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNsRSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ25FO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxHQUFHO0FBQ3RCO0FBQ0EsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNDLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQztBQUNBO0FBQ0E7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdEMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN0QyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDeEM7QUFDQTtBQUNBO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDdkQsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDdkQsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUs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Q0Y7QUFDQSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUc7QUFDVjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ25DLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ25DLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ25DO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRztBQUNuQjtBQUNBO0FBQ0E7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN4RCxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN4RCxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN4RDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUc7QUFDL0I7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDMUQsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQzFELEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUMxRDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUc7QUFDekI7QUFDQSxFQUFFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMvQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3JHO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxLQUFLLEdBQUc7QUFDVDtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNoQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENB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QyxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDO0FBQ3JDLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUM7QUFDckM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssR0FBRztBQUM5QjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQztBQUMxQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUM7QUFDMUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDO0FBQzFDO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHO0FBQ1o7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDdEM7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3RCO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMs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QUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFQSxTQUFPLENBQUMsQ0FBQyxFQUFFQSxTQUFPLENBQUMsQ0FBQyxFQUFFQSxTQUFPLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDckQ7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLENBQUMsR0FBRztBQUMxQjtBQUNBO0FBQ0EsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDbEM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLElBQUksRUFBRSxLQUFLLEdBQUc7QUFDZjtBQUNBLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzlDO0FBQ0EsRUFBRSxLQUFLLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxHQUFHLFdBQVcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzFEO0FBQ0EsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNYO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRztBQUNsQjtBQUNBLEVBQUUsS0FBSyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN4RDtBQUNBLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMxQztBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxFQUFFLEtBQUss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QUMsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDbEMsR0FBRyxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDbEM7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM5QixFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM5QjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUMxQjtBQUNBLEVBQUUsS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDekI7QUFDQSxFQUFFLEtBQUssSUFBSSxDQUFDLFVBQVUsR0FBRztBQUN6QjtBQUNBLEdBQUcsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2xDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2xDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2xDO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDOUIsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDOUIsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDOUI7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFD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QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLElBQUksRUFBRSxHQUFHLEdBQUc7QUFDYjtBQUNBLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzNCLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzNCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxTQUFTLEdBQUc7QUFDYjtBQUNBLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUM7QUFDcEQsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQztBQUNwRDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxHQUFHO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ25HO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxTQUFTLEVBQUUsTUFBTSxHQUFHO0FBQ3JCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDaEg7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE9BQU8sRUFBRSxNQUFNLEdBQUc7QUFDbkI7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFGO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxhQUFhLEVBQUUsS0FBSyxHQUFHO0FBQ3hCO0FBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUN4QixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3hCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxjQUFjLEVBQUUsTUFBTSxHQUFHO0FBQzFCO0FBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUN6QixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQ3pCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxjQUFjLEVBQUUsTUFBTSxHQUFHO0FBQzFCO0FBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQ2pDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDL0I7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsT0FBTyxHQUFHLEtBQUssR0FBRztBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUMzQztBQUNBLEVBQUUsS0FBSyxNQUFNLENBQUMsV0FBVyxLQUFLLFNBQVMsR0FBRztBQUMxQztBQUNBLEdBQUcsS0FBSyxNQUFNLENBQUMsV0FBVyxLQUFLLElBQUksR0FBRztBQUN0QztBQUNBLElBQUksTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDaEM7QUFDQSxJQUFJO0FBQ0o7QUFDQSxHQUFHQyxNQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQyxHQUFHQSxNQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUMzQztBQUNBLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRUEsTUFBSSxFQUFFLENBQUM7QUFDdEI7QUFDQSxHQUFHLE1BQU07QUFDVDtBQUNBLEdBQUcsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNwQztBQUNBLEdBQUcsS0FBSyxRQUFRLEtBQUssU0FBUyxHQUFHO0FBQ2pDO0FBQ0EsSUFBSSxLQUFLLE9BQU8sSUFBSSxRQUFRLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsS0FBSyxTQUFTLEdBQUc7QUFDdEc7QUFDQSxLQUFLLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO0FBQ25ELEtBQUssTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRztBQUN4RDtBQUNBLE1BQU1ELFNBQU8sQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNwRixNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUVBLFNBQU8sRUFBRSxDQUFDO0FBQ3BDO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsS0FBSyxNQUFNO0FBQ1g7QUFDQSxLQUFLLEtBQUssUUFBUSxDQUFDLFdBQVcsS0FBSyxJQUFJLEdBQUc7QUFDMUM7QUFDQSxNQUFNLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQ3BDO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsS0FBS0MsTUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDdkMsS0FBS0EsTUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDN0M7QUFDQSxLQUFLLElBQUksQ0FBQyxLQUFLLEVBQUVBLE1BQUksRUFBRSxDQUFDO0FBQ3hCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRSxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ25DO0FBQ0EsRUFBRSxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHO0FBQ3REO0FBQ0EsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUNqRDtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsYUFBYSxFQUFFLEtBQUssR0FBRztBQUN4QjtBQUNBLEVBQUUsT0FBTyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JELEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQy9EO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHO0FBQ3BCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzRCxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyRCxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3REO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsT0FBTyxNQUFNLENBQUMsR0FBRztBQUNuQixHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUN6RCxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUN6RCxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUN6RCxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsYUFBYSxFQUFFLEdBQUcsR0FBRztBQUN0QjtBQUNBO0FBQ0EsRUFBRSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RCxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuRCxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbkU7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sR0FBRztBQUM1QjtBQUNBO0FBQ0EsRUFBRSxJQUFJLENBQUMsVUFB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QUFDQTtBQUNBLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUM1QixFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUMzQztBQUNBO0FBQ0EsRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDeEMsRUFBRUUsS0FBRyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQ3hDLEVBQUVDLEtBQUcsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUN4QztBQUNBO0FBQ0EsRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFRCxLQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDN0IsRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFQyxLQUFHLEVBQUVELEtBQUcsRUFBRSxDQUFDO0FBQzdCLEVBQUUsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUVDLEtBQUcsRUFBRSxDQUFDO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxJQUFJLElBQUksR0FBRztBQUNiLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzFELEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzFELEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzFELEdBQUcsQ0FBQztBQUNKLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFRCxLQUFHLEVBQUVDLEtBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztBQUN2RDtBQUNBLEdBQUcsT0FBTyxLQUFLLENBQUM7QUFDaEI7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN2QyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRUQsS0FBRyxFQUFFQyxLQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7QUFDdkQ7QUFDQSxHQUFHLE9BQU8sS0FBSyxDQUFDO0FBQ2hCO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEVBQUUsZUFBZSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDM0MsRUFBRSxJQUFJLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3JFO0FBQ0EsRUFBRSxPQUFPLFVBQVUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFRCxLQUFHLEVBQUVDLEtBQUcsRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUNyRDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUc7QUFDN0I7QUFDQSxFQUFFLE9BQU8sTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUQ7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLGVBQWUsRUFBRSxLQUFLLEdBQUc7QUFDMUI7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUVILFNBQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUMvRDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxHQUFHO0FBQzdCO0FBQ0EsRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRztBQUN4QjtBQUNBLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3RCO0FBQ0EsR0FBRyxNQUFNO0FBQ1Q7QUFDQSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ25DO0FBQ0EsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUVBLFNBQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUMxRDtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsT0FBTyxNQUFNLENBQUM7QUFDaEI7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsRUFBRSxHQUFHLEdBQUc7QUFDbEI7QUFDQSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQjtBQUNBO0FBQ0EsRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDekM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEtBQUssRUFBRSxHQUFHLEdBQUc7QUFDZDtBQUNBLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFCLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxZQUFZLEVBQUUsTUFBTSxHQUFHO0FBQ3hCO0FBQ0E7QUFDQSxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLE9BQU8sSUFBSSxDQUFDO0FBQ3BDO0FBQ0E7QUFDQSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDaEYsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQ2hGLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNoRixFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDaEYsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQ2hGLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNoRixFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDaEYsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQ2hGO0FBQ0EsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQ2hDO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxTQUFTLEVBQUUsTUFBTSxHQUFHO0FBQ3JCO0FBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUN6QixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQ3pCO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHO0FBQ2Y7QUFDQSxFQUFFLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNsRTtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUM7QUFDRDtBQUNBLE1BQU0sT0FBTyxHQUFHO0FBQ2hCLGVBQWUsSUFBSSxPQUFPLEVBQUU7QUFDNUIsZUFBZSxJQUFJLE9BQU8sRUFBRTtBQUM1QixlQUFlLElBQUksT0FBTyxFQUFFO0FBQzVCLGVBQWUsSUFBSSxPQUFPLEVBQUU7QUFDNUIsZUFBZSxJQUFJLE9BQU8sRUFBRTtBQUM1QixlQUFlLElBQUksT0FBTyxFQUFFO0FBQzVCLGVBQWUsSUFBSSxPQUFPLEVBQUU7QUFDNUIsZUFBZSxJQUFJLE9BQU8sRUFBRTtBQUM1QixDQUFDLENBQUM7QUFDRjtBQUNBLE1BQU1BLFNBQU8saUJBQWlCLElBQUksT0FBTyxFQUFFLENBQUM7QUFDNUM7QUFDQSxNQUFNQyxNQUFJLGlCQUFpQixJQUFJLElBQUksRUFBRSxDQUFDO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBLE1BQU0sR0FBRyxpQkFBaUIsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUN4QyxNQUFNQyxLQUFHLGlCQUFpQixJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQ3hDLE1BQU1DLEtBQUcsaUJBQWlCLElBQUksT0FBTyxFQUFFLENBQUM7QUFDeEM7QUFDQTtBQUNBO0FBQ0EsTUFBTSxHQUFHLGlCQUFpQixJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQ3hDLE1BQU0sR0FBRyxpQkFBaUIsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUN4QyxNQUFNLEdBQUcsaUJBQWlCLElBQUksT0FBTyxFQUFFLENBQUM7QUFDeEM7QUFDQSxNQUFNLE9BQU8saUJBQWlCLElBQUksT0FBTyxFQUFFLENBQUM7QUFDNUMsTUFBTSxRQUFRLGlCQUFpQixJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQzdDLE1BQU0sZUFBZSxpQkFBaUIsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUNwRCxNQUFNLFNBQVMsaUJBQWlCLElBQUksT0FBTyxFQUFFLENBQUM7QUFDOUM7QUFDQSxTQUFTLFVBQVUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxHQUFHO0FBQ2pEO0FBQ0EsQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHO0FBQ3hEO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNqQztBQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUg7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDakMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQ2pDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNqQztBQUNBLEVBQUUsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRztBQUMxRTtBQUNBO0FBQ0E7QUFDQSxHQUFHLE9BQU8sS0FBSyxDQUFDO0FBQ2hCO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxPQUFPLElBQUksQ0FBQztBQUNiO0FBQ0E7O0FDbGdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sZUFBZSxDQUFDO0FBQ3RCO0FBQ0EsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsUUFBUSxHQUFHO0FBQ3BDO0FBQ0EsRUFBRSxLQUFLLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQzVEO0FBQ0EsRUFBRSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0FBQ3BDO0FBQ0EsRUFBRSxLQUFLLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxTQUFTLEdBQUc7QUFDekM7QUFDQSxHQUFHLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUI7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLEtBQUssU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRztBQUN2RDtBQUNBLEdBQUcsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUN0QztBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLFFBQVEsR0FBRztBQUNwQztBQUNBLEVBQUUsS0FBSyxJQUFJLENBQUMsVUFBVSxLQUFLLFNBQVMsR0FBRyxPQUFPLEtBQUssQ0FBQztBQUNwRDtBQUNBLEVBQUUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUNwQztBQUNBLEVBQUUsT0FBTyxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssU0FBUyxJQUFJLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDMUY7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLG1CQUFtQixFQUFFLElBQUksRUFBRSxRQUFRLEdBQUc7QUFDdkM7QUFDQSxFQUFFLEtBQUssSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLEdBQUcsT0FBTztBQUM5QztBQUNBLEVBQUUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUNwQyxFQUFFLE1BQU0sYUFBYSxHQUFHLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUMxQztBQUNBLEVBQUUsS0FBSyxhQUFhLEtBQUssU0FBUyxHQUFHO0FBQ3JDO0FBQ0EsR0FBRyxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDO0FBQ25EO0FBQ0EsR0FBRyxLQUFLLEtBQUssS0FBSyxFQUFFLENBQUMsR0FBRztBQUN4QjtBQUNBLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDckM7QUFDQSxJQUFJO0FBQ0o7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLGFBQWEsRUFBRSxLQUFLLEdBQUc7QUFDeEI7QUFDQSxFQUFFLEtBQUssSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLEdBQUcsT0FBTztBQUM5QztBQUNBLEVBQUUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUNwQyxFQUFFLE1BQU0sYUFBYSxHQUFHLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDaEQ7QUFDQSxFQUFFLEtBQUssYUFBYSxLQUFLLFNBQVMsR0FBRztBQUNyQztBQUNBLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDdkI7QUFDQTtBQUNBLEdBQUcsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUMxQztBQUNBLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRztBQUNwRDtBQUNBLElBQUksS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDbkM7QUFDQSxJQUFJO0FBQ0o7QUFDQSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FDaEZBLE1BQU1GLE1BQUksaUJBQWlCLElBQUksSUFBSSxFQUFFLENBQUM7QUFDdEMsTUFBTUMsS0FBRyxpQkFBaUIsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUN4QyxNQUFNLEdBQUcsaUJBQWlCLElBQUksT0FBTyxFQUFFLENBQUM7QUFDeEM7QUFDQSxNQUFNLE1BQU0sQ0FBQztBQUNiO0FBQ0EsQ0FBQyxXQUFXLEVBQUUsTUFBTSxHQUFHLElBQUksT0FBTyxFQUFFLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxHQUFHO0FBQ3JEO0FBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUN2QixFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3ZCO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRztBQUN2QjtBQUNBLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDN0IsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUN2QjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxjQUFjLEdBQUc7QUFDekM7QUFDQSxFQUFFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDN0I7QUFDQSxFQUFFLEtBQUssY0FBYyxLQUFLLFNBQVMsR0FBRztBQUN0QztBQUNBLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsQ0FBQztBQUNqQztBQUNBLEdBQUcsTUFBTTtBQUNUO0FBQ0EsR0FBR0QsTUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDcEQ7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztBQUN0QjtBQUNBLEVBQUUsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRztBQUN0RDtBQUNBLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ2xGO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUM7QUFDekM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLElBQUksRUFBRSxNQUFNLEdBQUc7QUFDaEI7QUFDQSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNwQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUM5QjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxHQUFHO0FBQ1g7QUFDQSxFQUFFLFNBQVMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUc7QUFDN0I7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsR0FBRztBQUNiO0FBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzdCLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNwQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsYUFBYSxFQUFFLEtBQUssR0FBRztBQUN4QjtBQUNBLEVBQUUsU0FBUyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHO0FBQ3JGO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxlQUFlLEVBQUUsS0FBSyxHQUFHO0FBQzFCO0FBQ0EsRUFBRSxTQUFTLEtBQUssQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUc7QUFDM0Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sR0FBRztBQUM1QjtBQUNBLEVBQUUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hEO0FBQ0EsRUFBRSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLFNBQVMsR0FBRyxTQUFTLEVBQUUsQ0FBQztBQUNyRjtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsYUFBYSxFQUFFLEdBQUcsR0FBRztBQUN0QjtBQUNBLEVBQUUsT0FBTyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDdEM7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLGVBQWUsRUFBRSxLQUFLLEdBQUc7QUFDMUI7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDekU7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHO0FBQzdCO0FBQ0EsRUFBRSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLEtBQUssRUFBRSxDQUFDO0FBQy9EO0FBQ0EsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3ZCO0FBQ0EsRUFBRSxLQUFLLGFBQWEsS0FBSyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRztBQUN2RDtBQUNBLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDekMsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzNEO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRSxPQUFPLE1BQU0sQ0FBQztBQUNoQjtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsY0FBYyxFQUFFLE1BQU0sR0FBRztBQUMxQjtBQUNBLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUc7QUFDeEI7QUFDQTtBQUNBLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3RCLEdBQUcsT0FBTyxNQUFNLENBQUM7QUFDakI7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekMsRUFBRSxNQUFNLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN2QztBQUNBLEVBQUUsT0FBTyxNQUFNLENBQUM7QUFDaEI7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFlBQVksRUFBRSxNQUFNLEdBQUc7QUFDeEI7QUFDQSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQ3JDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQ3pEO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxTQUFTLEVBQUUsTUFBTSxHQUFHO0FBQ3JCO0FBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUM1QjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsYUFBYSxFQUFFLEtBQUssR0FBRztBQUN4QjtBQUNBLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUc7QUFDeEI7QUFDQSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQzdCO0FBQ0EsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNuQjtBQUNBLEdBQUcsT0FBTyxJQUFJLENBQUM7QUFDZjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUVDLEtBQUcsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN2QztBQUNBLEVBQUUsTUFBTSxRQUFRLEdBQUdBLEtBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNsQztBQUNBLEVBQUUsS0FBSyxRQUFRLEtBQUssSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUc7QUFDbEQ7QUFDQTtBQUNBO0FBQ0EsR0FBRyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDO0FBQ3hDO0FBQ0EsR0FBRyxNQUFNLEtBQUssR0FBRyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxLQUFLLEdBQUcsQ0FBQztBQUNoRDtBQUNBLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUVBLEtBQUcsRUFBRSxLQUFLLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFDdEQ7QUFDQSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDO0FBQ3hCO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxLQUFLLEVBQUUsTUFBTSxHQUFHO0FBQ2pCO0FBQ0EsRUFBRSxLQUFLLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRztBQUMxQjtBQUNBLEdBQUcsT0FBTyxJQUFJLENBQUM7QUFDZjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUc7QUFDeEI7QUFDQSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDdkI7QUFDQSxHQUFHLE9BQU8sSUFBSSxDQUFDO0FBQ2Y7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksR0FBRztBQUN0RDtBQUNBLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pEO0FBQ0EsR0FBRyxNQUFNO0FBQ1Q7QUFDQSxHQUFHLEdBQUcsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMzRTtBQUNBLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRUEsS0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDOUQ7QUFDQSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUVBLEtBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQzlEO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxNQUFNLEVBQUUsTUFBTSxHQUFHO0FBQ2xCO0FBQ0EsRUFBRSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNsRjtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsS0FBSyxHQUFHO0FBQ1Q7QUFDQSxFQUFFLE9BQU8sSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQzdDO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FDN09BLE1BQU0sT0FBTyxDQUFDO0FBQ2Q7QUFDQSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUc7QUFDL0Y7QUFDQSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUNyQztBQUNBLEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRztBQUNsQjtBQUNBLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNiO0FBQ0EsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLEtBQUssR0FBRyxLQUFLLFNBQVMsR0FBRztBQUMzQjtBQUNBLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM5RjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRztBQUN2RjtBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzQjtBQUNBLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUM5RCxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFDOUQsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDO0FBQy9ELEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUMvRDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsUUFBUSxHQUFHO0FBQ1o7QUFDQSxFQUFFLElBQUksQ0FBQyxHQUFHO0FBQ1Y7QUFDQSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEVB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QyxFQUFFLEdBQUcsTUFBTSxDQUFDO0FBQzdCLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFDN0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQztBQUM3QixFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDZDtBQUNBLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFDN0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQztBQUM3QixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsTUFBTSxDQUFDO0FBQy9CLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNmO0FBQ0EsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2Y7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLHFCQUFxQixFQUFFLEtBQUssR0FBRztBQUNoQztBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzQjtBQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUM5QyxFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDN0MsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzdDLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM3QztBQUNBLEVBQUUsS0FBSyxLQUFLLENBQUMsS0FBSyxLQUFLLEtBQUssR0FBRztBQUMvQjtBQUNBLEdBQUcsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4RDtBQUNBLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNmO0FBQ0EsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDekIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDekIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCO0FBQ0EsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDekIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDekIsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwQjtBQUNBLEdBQUcsTUFBTSxLQUFLLEtBQUssQ0FBQyxLQUFLLEtBQUssS0FBSyxHQUFHO0FBQ3RDO0FBQ0EsR0FBRyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hEO0FBQ0EsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDekIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDekIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQjtBQUNBLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQixHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNqQjtBQUNBLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEI7QUFDQSxHQUFHLE1BQU0sS0FBSyxLQUFLLENBQUMsS0FBSyxLQUFLLEtBQUssR0FBRztBQUN0QztBQUNBLEdBQUcsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4RDtBQUNBLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN6QjtBQUNBLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDekI7QUFDQSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwQjtBQUNBLEdBQUcsTUFBTSxLQUFLLEtBQUssQ0FBQyxLQUFLLEtBQUssS0FBSyxHQUFHO0FBQ3RDO0FBQ0EsR0FBRyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hEO0FBQ0EsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQixHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN6QixHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN6QjtBQUNBLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDekIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDekI7QUFDQSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNqQixHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEI7QUFDQSxHQUFHLE1BQU0sS0FBSyxLQUFLLENBQUMsS0FBSyxLQUFLLEtBQUssR0FBRztBQUN0QztBQUNBLEdBQUcsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4RDtBQUNBLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDekIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDekI7QUFDQSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDZixHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQjtBQUNBLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN6QixHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMxQjtBQUNBLEdBQUcsTUFBTSxLQUFLLEtBQUssQ0FBQyxLQUFLLEtBQUssS0FBSyxHQUFHO0FBQ3RDO0FBQ0EsR0FBRyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hEO0FBQ0EsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQixHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNqQixHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25CO0FBQ0EsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENB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QUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3BFLEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3BFLEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3JFLEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3JFO0FBQ0EsRUFBRSxNQUFNLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDcEUsRUFBRSxNQUFNLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDcEUsRUFBRSxNQUFNLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDckUsRUFBRSxNQUFNLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDckU7QUFDQSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzFELEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDMUQsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUMxRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzNEO0FBQ0EsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUMxRCxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzFELEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDMUQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUMzRDtBQUNBLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDMUQsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUMxRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzNELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDM0Q7QUFDQSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzFELEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDMUQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUMzRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzNEO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHO0FBQ3JCO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzNCO0FBQ0EsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzFELEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMxRCxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0QsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNEO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxXQUFXLEdBQUc7QUFDZjtBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzQjtBQUNBLEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3BFLEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3BFLEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3JFLEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGLEdBQUcsR0FBRztBQUNOLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDckIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsSUFBSTtBQUNKLEdBQUcsR0FBRztBQUNOLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDckIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsSUFBSTtBQUNKLEdBQUcsR0FBRztBQUNOLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDckIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsSUFBSTtBQUNKLEdBQUcsR0FBRztBQUNOLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDckIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEIsSUFBSTtBQUNKO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxTQUFTLEdBQUc7QUFDYjtBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzQixFQUFFLElBQUksR0FBRyxDQUFDO0FBQ1Y7QUFDQSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUNsRCxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUNsRCxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUNsRDtBQUNBLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDO0FBQ3BELEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDO0FBQ3BELEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDO0FBQ3REO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDeEI7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0I7QUFDQSxFQUFFLEtBQUssQ0FBQyxDQUFDLFNBQVMsR0FBRztBQUNyQjtBQUNBLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQixHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCO0FBQ0EsR0FBRyxNQUFNO0FBQ1Q7QUFDQSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDaEIsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNoQjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsTUFBTSxHQUFHO0FBQ1Y7QUFDQTtBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVE7QUFDMUI7QUFDQSxHQUFHLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzdELEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDN0QsR0FBRyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRTtBQUMvRCxHQUFHLEdBQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFO0FBQ2pFO0FBQ0EsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ2xILEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUNsSCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDbEgsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDbkg7QUFDQSxFQUFFLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDNUQ7QUFDQSxFQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDckY7QUFDQSxFQUFFLE1BQU0sTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDekI7QUFDQSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO0FBQ3pCLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssTUFBTSxDQUFDO0FBQ25JLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssTUFBTSxDQUFDO0FBQ25JLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssTUFBTSxDQUFDO0FBQ25JO0FBQ0EsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQztBQUN6QixFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxLQUFLLE1BQU0sQ0FBQztBQUNuSSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxLQUFLLE1BQU0sQ0FBQztBQUNuSSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxLQUFLLE1BQU0sQ0FBQztBQUNuSTtBQUNBLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUM7QUFDekIsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsS0FBSyxNQUFNLENBQUM7QUFDbkksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsS0FBSyxNQUFNLENBQUM7QUFDcEksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsS0FBSyxNQUFNLENBQUM7QUFDcEk7QUFDQSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO0FBQzFCLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssTUFBTSxDQUFDO0FBQ3BJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssTUFBTSxDQUFDO0FBQ3BJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssTUFBTSxDQUFDO0FBQ3BJO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHO0FBQ1o7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0IsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xDO0FBQ0EsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0MsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0MsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLGlCQUFpQixHQUFHO0FBQ3JCO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzNCO0FBQ0EsRUFBRSxNQUFNLFFBQVEsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM3RSxFQUFFLE1BQU0sUUFBUSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzdFLEVBQUUsTUFBTSxRQUFRLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDL0U7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQztBQUMvRDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQzVCO0FBQ0EsRUFBRSxLQUFLLENBQUMsQ0FBQyxTQUFTLEdBQUc7QUFDckI7QUFDQSxHQUFHLElBQUksQ0FBQyxHQUFHO0FBQ1g7QUFDQSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2hCLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDaEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNoQixJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDZDtBQUNBLElBQUksQ0FBQztBQUNMO0FBQ0EsR0FBRyxNQUFNO0FBQ1Q7QUFDQSxHQUFHLElBQUksQ0FBQyxHQUFHO0FBQ1g7QUFDQSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDZCxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDZCxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDZCxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDZDtBQUNBLElBQUksQ0FBQztBQUNMO0FBQ0EsR0FBRztBQUNIO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxhQUFhLEVBQUUsS0FBSyxHQUFHO0FBQ3hCO0FBQ0EsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3JEO0FBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRztBQUNWO0FBQ0EsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDYjtBQUNBLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxhQUFhLEVBQUUsS0FBSyxHQUFHO0FBQ3hCO0FBQ0EsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3JEO0FBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRztBQUNWO0FBQ0EsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2QsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDZixJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDZDtBQUNBLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxhQUFhLEVBQUUsS0FBSyxHQUFHO0FBQ3hCO0FBQ0EsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3JEO0FBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRztBQUNWO0FBQ0EsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDYjtBQUNBLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsS0FBSyxHQUFHO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUM5QixFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDOUIsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMzQyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0I7QUFDQSxFQUFFLElBQUksQ0FBQyxHQUFHO0FBQ1Y7QUFDQSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNoRCxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNoRCxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2I7QUFDQSxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3RCO0FBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRztBQUNWO0FBQ0EsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2I7QUFDQSxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHO0FBQ3JDO0FBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRztBQUNWO0FBQ0EsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ2YsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ2YsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2I7QUFDQSxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxHQUFHO0FBQ3hDO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzNCO0FBQ0EsRUFBRSxNQUFNLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDO0FBQ25GLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDOUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzlDLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUM5QztBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNqRDtBQUNBLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDckMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUM3QixFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQzdCLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNkO0FBQ0EsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUM3QixFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3JDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDN0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2Q7QUFDQSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQzdCLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDN0IsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDZjtBQUNBLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDeEIsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUN4QixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNmO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEdBQUc7QUFDMUM7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0I7QUFDQSxFQUFFLElBQUksRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekQsRUFBRSxNQUFNLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzNELEVBQUUsTUFBTSxFQUFFLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM1RDtBQUNBO0FBQ0EsRUFBRSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDakMsRUFBRSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQzNCO0FBQ0EsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUN4QixFQUFFLFFBQVEsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3hCLEVBQUUsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDeEI7QUFDQTtBQUNBLEVBQUVFLEtBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDbkI7QUFDQSxFQUFFLE1BQU0sS0FBSyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdkIsRUFBRSxNQUFNLEtBQUssR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLEVBQUUsTUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN2QjtBQUNBLEVBQUVBLEtBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDO0FBQzdCLEVBQUVBLEtBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDO0FBQzdCLEVBQUVBLEtBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDO0FBQzdCO0FBQ0EsRUFBRUEsS0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUM7QUFDN0IsRUFBRUEsS0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUM7QUFDN0IsRUFBRUEsS0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUM7QUFDN0I7QUFDQSxFQUFFQSxLQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQztBQUM3QixFQUFFQSxLQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQztBQUM3QixFQUFFQSxLQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxJQUFJLEtBQUssQ0FBQztBQUM5QjtBQUNBLEVBQUUsVUFBVSxDQUFDLHFCQUFxQixFQUFFQSxLQUFHLEVBQUUsQ0FBQztBQUMxQztBQUNBLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDZixFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2YsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNmO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsZ0JBQWdCLEdBQUcscUJBQXFCLEdBQUc7QUFDbEc7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0IsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxLQUFLLEtBQUssR0FBRyxJQUFJLEVBQUUsQ0FBQztBQUN4QyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEtBQUssR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBQ3hDO0FBQ0EsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssR0FBRyxJQUFJLE9BQU8sS0FBSyxHQUFHLElBQUksRUFBRSxDQUFDO0FBQ2hELEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsTUFBTSxPQUFPLEdBQUcsR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUNoRDtBQUNBLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ1g7QUFDQSxFQUFFLEtBQUssZ0JBQWdCLEtBQUsscUJBQXFCLEdBQUc7QUFDcEQ7QUFDQSxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsR0FBRyxJQUFJLEVBQUUsS0FBSyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7QUFDekMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxPQUFPLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQztBQUM3QztBQUNBLEdBQUcsTUFBTSxLQUFLLGdCQUFnQixLQUFLLHNCQUFzQixHQUFHO0FBQzVEO0FBQ0EsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDO0FBQzlCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsSUFBSSxPQUFPLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQztBQUN6QztBQUNBLEdBQUcsTUFBTTtBQUNUO0FBQ0EsR0FBRyxNQUFNLElBQUksS0FBSyxFQUFFLDhEQUE4RCxHQUFHLGdCQUFnQixFQUFFLENBQUM7QUFDeEc7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdkQsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZELEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN4RCxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN6RDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsZ0JBQWdCLEdBQUcscUJBQXFCLEdBQUc7QUFDbkc7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0IsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLEtBQUssS0FBSyxHQUFHLElBQUksRUFBRSxDQUFDO0FBQ25DLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUNuQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7QUFDakM7QUFDQSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUM7QUFDakMsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQyxDQUFDO0FBQ2pDO0FBQ0EsRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUUsS0FBSyxnQkFBZ0IsS0FBSyxxQkFBcUIsR0FBRztBQUNwRDtBQUNBLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUM7QUFDMUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCO0FBQ0EsR0FBRyxNQUFNLEtBQUssZ0JBQWdCLEtBQUssc0JBQXNCLEdBQUc7QUFDNUQ7QUFDQSxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQjtBQUNBLEdBQUcsTUFBTTtBQUNUO0FBQ0EsR0FBRyxNQUFNLElBQUksS0FBSyxFQUFFLCtEQUErRCxHQUFHLGdCQUFnQixFQUFFLENBQUM7QUFDekc7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDL0QsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2hFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQy9ELEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMzRDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsTUFBTSxFQUFFLE1BQU0sR0FBRztBQUNsQjtBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzQixFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDN0I7QUFDQSxFQUFFLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUc7QUFDbEM7QUFDQSxHQUFHLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxPQUFPLEtBQUssQ0FBQztBQUMzQztBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxHQUFHO0FBQ2hDO0FBQ0EsRUFBRSxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHO0FBQ2xDO0FBQ0EsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFDNUM7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE9BQU8sRUFBRSxLQUFLLEdBQUcsRUFBRSxFQUFFLE1BQU0sR0FBRyxDQUFDLEdBQUc7QUFDbkM7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0I7QUFDQSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDNUIsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNoQyxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hDLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEM7QUFDQSxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hDLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEMsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNoQyxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hDO0FBQ0EsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNoQyxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hDLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDbEMsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUNsQztBQUNBLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDbEMsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUNsQyxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsRUFB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QSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLHFCQUFxQixFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEdBQUcsSUFBSSxHQUFHO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUN4QixFQUFFLE1BQU0sR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDcEQsRUFBRSxNQUFNLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3BELEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUNyRDtBQUNBLEVBQUUsU0FBUyxLQUFLO0FBQ2hCO0FBQ0EsR0FBRyxLQUFLLEtBQUs7QUFDYjtBQUNBLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNoRDtBQUNBLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLFNBQVMsR0FBRztBQUN2QztBQUNBLEtBQUssSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3hDLEtBQUssSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3hDO0FBQ0EsS0FBSyxNQUFNO0FBQ1g7QUFDQSxLQUFLLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDdEMsS0FBSyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNqQjtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTTtBQUNWO0FBQ0EsR0FBRyxLQUFLLEtBQUs7QUFDYjtBQUNBLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ2xEO0FBQ0EsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsU0FBUyxHQUFHO0FBQ3ZDO0FBQ0EsS0FBSyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3RDLEtBQUssSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUN0QztBQUNBLEtBQUssTUFBTTtBQUNYO0FBQ0EsS0FBSyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDeEMsS0FBSyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNqQjtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTTtBQUNWO0FBQ0EsR0FBRyxLQUFLLEtBQUs7QUFDYjtBQUNBLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FB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REEsTUFBTSxPQUFPLENBQUM7QUFDZDtBQUNBLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHO0FBQzVEO0FBQ0EsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDckM7QUFDQSxFQUFFLElBQUksQ0FBQyxRQUFRLEdBQUc7QUFDbEI7QUFDQSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNWLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ1YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDVjtBQUNBLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxLQUFLLEdBQUcsS0FBSyxTQUFTLEdBQUc7QUFDM0I7QUFDQSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMzRDtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHO0FBQ3BEO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzNCO0FBQ0EsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFDOUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFDOUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFDOUM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFFBQVEsR0FBRztBQUNaO0FBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRztBQUNWO0FBQ0EsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDVixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNWLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ1Y7QUFDQSxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRztBQUNYO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzNCLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUN4QjtBQUNBLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzFELEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFF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QUFNLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3BELEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNwRCxFQUFFLE1BQU0sR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDcEQ7QUFDQSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUM5QyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUM5QyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUM5QztBQUNBLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzlDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzlDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzlDO0FBQ0EsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDOUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDOUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDOUM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUc7QUFDckI7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0I7QUFDQSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQztBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsV0FBVyxHQUFHO0FBQ2Y7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0I7QUFDQSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzdDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQ3hDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDekM7QUFDQSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0U7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE1BQU0sR0FBRztBQUNWO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUTtBQUMxQjtBQUNBLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzlDLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzlDLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzlDO0FBQ0EsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUM5QixHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQzlCLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDOUI7QUFDQSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUMzQztBQUNBLEVBQUUsS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLE9BQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hFO0FBQ0EsRUFBRSxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3pCO0FBQ0EsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQztBQUN6QixFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsS0FBSyxNQUFNLENBQUM7QUFDL0MsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssTUFBTSxDQUFDO0FBQy9DO0FBQ0EsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQztBQUN6QixFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsS0FBSyxNQUFNLENBQUM7QUFDL0MsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssTUFBTSxDQUFDO0FBQy9DO0FBQ0EsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQztBQUN6QixFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsS0FBSyxNQUFNLENBQUM7QUFDL0MsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssTUFBTSxDQUFDO0FBQy9DO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxTQUFTLEdBQUc7QUFDYjtBQUNBLEVBQUUsSUFBSSxHQUFHLENBQUM7QUFDVixFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDMUI7QUFDQSxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUM5QyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUM5QyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVB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O0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxDQUFDLEdBQUc7QUFDaEM7QUFDQSxFQUFFLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUc7QUFDakM7QUFDQSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUM1QztBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsTUFBTSxHQUFHLENBQUMsR0FBRztBQUNuQztBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzQjtBQUNBLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM1QixFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hDLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEM7QUFDQSxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hDLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEMsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNoQztBQUNBLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FB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LGVBQWUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDdEQ7QUFDQSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQztBQUN0RDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsVUFBVSxFQUFFLFFBQVEsR0FBRztBQUN4QjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUNsRDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsVUFBVSxFQUFFLFFBQVEsR0FBRztBQUN4QjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUNsRDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsVUFBVSxFQUFFLFFBQVEsR0FBRztBQUN4QjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUNsRDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsWUFBWSxFQUFFLE1BQU0sR0FBRztBQUN4QjtBQUNBLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUN4QztBQUNBLEVBQUUsT0FBTyxNQUFNLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNqRDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsWUFBWSxFQUFFLE1BQU0sR0FBRztBQUN4QjtBQUNBLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUN4QztBQUNBLEVBQUUsT0FBTyxNQUFNLENBQUMsWUFBWSxFQUFFRCxLQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxD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SyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sR0FBRztBQUNuQztBQUNBLEtBQUssTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2xEO0FBQ0EsS0FBSyxNQUFNLEtBQUssSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUc7QUFDNUM7QUFDQSxLQUFLLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQzdEO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsR0FBRyxLQUFLLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsS0FBSyxJQUFJLEdBQUc7QUFDNUc7QUFDQSxJQUFJLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQzlEO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsR0FBRyxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUc7QUFDNUQ7QUFDQSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2pFO0FBQ0EsR0FBRyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztBQUMvQztBQUNBLEdBQUcsS0FBSyxVQUFVLEtBQUssU0FBUyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssU0FBUyxHQUFHO0FBQ3RFO0FBQ0EsSUFBSSxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0FBQ3JDO0FBQ0EsSUFBSSxLQUFLLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUc7QUFDbkM7QUFDQSxLQUFLLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUc7QUFDdkQ7QUFDQSxNQUFNLE1BQU0sS0FBSyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNoQztBQUNBLE1BQU0sU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDdEM7QUFDQSxNQUFNO0FBQ047QUFDQSxLQUFLLE1BQU07QUFDWDtBQUNBLEtBQUssU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDdEM7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJO0FBQ0o7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLEtBQUssSUFBSSxDQUFDLGFBQWEsR0FBRztBQUM1QjtBQUNBLEdBQUcsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ25DLEdBQUcsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2pEO0FBQ0EsR0FBRyxLQUFLLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxHQUFHO0FBQ3RDO0FBQ0EsSUFBSSxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDL0M7QUFDQSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7QUFDekM7QUFDQSxJQUFJO0FBQ0o7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLEtBQUssSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLEdBQUc7QUFDckM7QUFDQSxHQUFHLEtBQUssS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUc7QUFDekM7QUFDQSxJQUFJLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNyQjtBQUNBLElBQUksTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUc7QUFDN0Q7QUFDQSxLQUFLLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDbkU7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQzVCO0FBQ0EsSUFBSSxNQUFNO0FBQ1Y7QUFDQSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEdBQUcsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2pFO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEVBQUUsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUc7QUFDbEM7QUFDQSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3hCO0FBQ0EsR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUc7QUFDckQ7QUFDQSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3JFO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEVBQUUsS0FBSyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUc7QUFDcEM7QUFDQSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQzFCO0FBQ0EsR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUc7QUFDdkQ7QUFDQSxJQUFJLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDM0M7QUFDQSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUM7QUFDdEU7QUFDQSxJQUFJO0FBQ0o7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLEtBQUssWUFBWSxHQUFHO0FBQ3RCO0FBQ0EsR0FBRyxNQUFNLFVBQVUsR0FBRyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDMUQsR0FBRyxNQUFNLFNBQVMsR0FBRyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDeEQsR0FBRyxNQUFNLFFBQVEsR0FBRyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDdEQsR0FBRyxNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDbEQsR0FBRyxNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDbEQsR0FBRyxNQUFNLFNBQVMsR0FBRyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDeEQsR0FBRyxNQUFNLFVBQVUsR0FBRyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDMUQsR0FBRyxNQUFNLEtBQUssR0FBRyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDaEQ7QUFDQSxHQUFHLEtBQUssVUFB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LEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDM0U7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUNySztBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsWUFBWSxFQUFFLFVBQVUsR0FBRyxjQUFjLEdBQUc7QUFDN0M7QUFDQSxFQUFFLE9BQU8sRUFBRSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLEdBQUcsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDOUU7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxHQUFHLGVBQWUsQ0FBQyxpQkFBaUIsR0FBRztBQUNsRTtBQUNBO0FBQ0E7QUFDQSxFQUFFLGVBQWUsQ0FBQyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDO0FBQzNFO0FBQ0EsRUFBRSxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2pEO0FBQ0EsRUFBRSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFD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QUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDL0Y7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqRztBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3RCO0FBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3ZCO0FBQ0EsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0M7QUFDQSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMzQztBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsR0FBRyxFQUFFLEtBQUssR0FBRztBQUNkO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDcEIsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDcEIsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDcEI7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHO0FBQzdCO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUMvQixFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQy9CLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDL0I7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUc7QUFDaEI7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2QsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNkLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsR0FBRyxFQUFFLEtBQUssR0FBRztBQUNkO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzNDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMzQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDM0M7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFFBQVEsRUFBRSxLQUFLLEdBQUc7QUFDbkI7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNwQixFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNwQixFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNwQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRztBQUNyQjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZCxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2QsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNkO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssR0FBRztBQUN0QjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUM7QUFDekMsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQztBQUN6QyxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDO0FBQ3pDO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEdBQUc7QUFDckM7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUM7QUFDdEQsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDO0FBQ3RELEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQztBQUN0RDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEdBQUc7QUFDekI7QUFDQSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDdkIsRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3hCO0FBQ0EsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQzVDLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUM1QyxFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDNUM7QUFDQSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN6QjtBQUNBLEVBQUUs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
