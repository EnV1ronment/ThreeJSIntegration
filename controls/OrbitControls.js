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

function clamp( value, min, max ) {

	return Math.max( min, Math.min( max, value ) );

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

/**
 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
 *
 * The polar angle (phi) is measured from the positive y-axis. The positive y-axis is up.
 * The azimuthal angle (theta) is measured from the positive z-axis.
 */


class Spherical {

	constructor( radius = 1, phi = 0, theta = 0 ) {

		this.radius = radius;
		this.phi = phi; // polar angle
		this.theta = theta; // azimuthal angle

		return this;

	}

	set( radius, phi, theta ) {

		this.radius = radius;
		this.phi = phi;
		this.theta = theta;

		return this;

	}

	copy( other ) {

		this.radius = other.radius;
		this.phi = other.phi;
		this.theta = other.theta;

		return this;

	}

	// restrict phi to be between EPS and PI-EPS
	makeSafe() {

		const EPS = 0.000001;
		this.phi = Math.max( EPS, Math.min( Math.PI - EPS, this.phi ) );

		return this;

	}

	setFromVector3( v ) {

		return this.setFromCartesianCoords( v.x, v.y, v.z );

	}

	setFromCartesianCoords( x, y, z ) {

		this.radius = Math.sqrt( x * x + y * y + z * z );

		if ( this.radius === 0 ) {

			this.theta = 0;
			this.phi = 0;

		} else {

			this.theta = Math.atan2( x, z );
			this.phi = Math.acos( clamp( y / this.radius, - 1, 1 ) );

		}

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

const MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2 };
const TOUCH = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 };

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

		return this.applyQuaternion( _quaternion.setFromEuler( euler ) );

	}

	applyAxisAngle( axis, angle ) {

		return this.applyQuaternion( _quaternion.setFromAxisAngle( axis, angle ) );

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

		_vector.copy( this ).projectOnVector( planeNormal );

		return this.sub( _vector );

	}

	reflect( normal ) {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		return this.sub( _vector.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

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

const _vector = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();

// OrbitControls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

class OrbitControls extends EventDispatcher {

	constructor(object, domElement) {

		super();

		this.object = object;
		this.domElement = domElement;
		this.domElement.style.touchAction = 'none'; // disable touch scroll

		// Set to false to disable this control
		this.enabled = true;

		// "target" sets the location of focus, where the object orbits around
		this.target = new Vector3();

		// How far you can dolly in and out ( PerspectiveCamera only )
		this.minDistance = 0;
		this.maxDistance = Infinity;

		// How far you can zoom in and out ( OrthographicCamera only )
		this.minZoom = 0;
		this.maxZoom = Infinity;

		// How far you can orbit vertically, upper and lower limits.
		// Range is 0 to Math.PI radians.
		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians

		// How far you can orbit horizontally, upper and lower limits.
		// If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
		this.minAzimuthAngle = - Infinity; // radians
		this.maxAzimuthAngle = Infinity; // radians

		// Set to true to enable damping (inertia)
		// If damping is enabled, you must call controls.update() in your animation loop
		this.enableDamping = false;
		this.dampingFactor = 0.05;

		// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
		// Set to false to disable zooming
		this.enableZoom = true;
		this.zoomSpeed = 1.0;

		// Set to false to disable rotating
		this.enableRotate = true;
		this.rotateSpeed = 1.0;

		// Set to false to disable panning
		this.enablePan = true;
		this.panSpeed = 1.0;
		this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
		this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

		// Set to true to automatically rotate around the target
		// If auto-rotate is enabled, you must call controls.update() in your animation loop
		this.autoRotate = false;
		this.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

		// The four arrow keys
		this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };

		// Mouse buttons
		this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

		// Touch fingers
		this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

		// for reset
		this.target0 = this.target.clone();
		this.position0 = this.object.position.clone();
		this.zoom0 = this.object.zoom;

		// the target DOM element for key events
		this._domElementKeyEvents = null;

		//
		// public methods
		//

		this.getPolarAngle = function () {

			return spherical.phi;

		};

		this.getAzimuthalAngle = function () {

			return spherical.theta;

		};

		this.getDistance = function () {

			return this.object.position.distanceTo(this.target);

		};

		this.listenToKeyEvents = function (domElement) {

			domElement.addEventListener('keydown', onKeyDown);
			this._domElementKeyEvents = domElement;

		};

		this.stopListenToKeyEvents = function () {

			this._domElementKeyEvents.removeEventListener('keydown', onKeyDown);
			this._domElementKeyEvents = null;

		};

		this.saveState = function () {

			scope.target0.copy(scope.target);
			scope.position0.copy(scope.object.position);
			scope.zoom0 = scope.object.zoom;

		};

		this.reset = function () {

			scope.target.copy(scope.target0);
			scope.object.position.copy(scope.position0);
			scope.object.zoom = scope.zoom0;

			scope.object.updateProjectionMatrix();
			scope.dispatchEvent(_changeEvent);

			scope.update();

			state = STATE.NONE;

		};

		// this method is exposed, but perhaps it would be better if we can make it private...
		this.update = function () {

			const offset = new Vector3();

			// so camera.up is the orbit axis
			const quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
			const quatInverse = quat.clone().invert();

			const lastPosition = new Vector3();
			const lastQuaternion = new Quaternion();
			const lastTargetPosition = new Vector3();

			const twoPI = 2 * Math.PI;

			return function update() {

				const position = scope.object.position;

				offset.copy(position).sub(scope.target);

				// rotate offset to "y-axis-is-up" space
				offset.applyQuaternion(quat);

				// angle from z-axis around y-axis
				spherical.setFromVector3(offset);

				if (scope.autoRotate && state === STATE.NONE) {

					rotateLeft(getAutoRotationAngle());

				}

				if (scope.enableDamping) {

					spherical.theta += sphericalDelta.theta * scope.dampingFactor;
					spherical.phi += sphericalDelta.phi * scope.dampingFactor;

				} else {

					spherical.theta += sphericalDelta.theta;
					spherical.phi += sphericalDelta.phi;

				}

				// restrict theta to be between desired limits

				let min = scope.minAzimuthAngle;
				let max = scope.maxAzimuthAngle;

				if (isFinite(min) && isFinite(max)) {

					if (min < - Math.PI) min += twoPI; else if (min > Math.PI) min -= twoPI;

					if (max < - Math.PI) max += twoPI; else if (max > Math.PI) max -= twoPI;

					if (min <= max) {

						spherical.theta = Math.max(min, Math.min(max, spherical.theta));

					} else {

						spherical.theta = (spherical.theta > (min + max) / 2) ?
							Math.max(min, spherical.theta) :
							Math.min(max, spherical.theta);

					}

				}

				// restrict phi to be between desired limits
				spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

				spherical.makeSafe();


				spherical.radius *= scale;

				// restrict radius to be between desired limits
				spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

				// move target to panned location

				if (scope.enableDamping === true) {

					scope.target.addScaledVector(panOffset, scope.dampingFactor);

				} else {

					scope.target.add(panOffset);

				}

				offset.setFromSpherical(spherical);

				// rotate offset back to "camera-up-vector-is-up" space
				offset.applyQuaternion(quatInverse);

				position.copy(scope.target).add(offset);

				scope.object.lookAt(scope.target);

				if (scope.enableDamping === true) {

					sphericalDelta.theta *= (1 - scope.dampingFactor);
					sphericalDelta.phi *= (1 - scope.dampingFactor);

					panOffset.multiplyScalar(1 - scope.dampingFactor);

				} else {

					sphericalDelta.set(0, 0, 0);

					panOffset.set(0, 0, 0);

				}

				scale = 1;

				// update condition is:
				// min(camera displacement, camera rotation in radians)^2 > EPS
				// using small-angle approximation cos(x/2) = 1 - x^2 / 8

				if (zoomChanged ||
					lastPosition.distanceToSquared(scope.object.position) > EPS ||
					8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS ||
					lastTargetPosition.distanceToSquared(scope.target) > 0) {

					scope.dispatchEvent(_changeEvent);

					lastPosition.copy(scope.object.position);
					lastQuaternion.copy(scope.object.quaternion);
					lastTargetPosition.copy(scope.target);

					zoomChanged = false;

					return true;

				}

				return false;

			};

		}();

		this.dispose = function () {

			scope.domElement.removeEventListener('contextmenu', onContextMenu);

			scope.domElement.removeEventListener('pointerdown', onPointerDown);
			scope.domElement.removeEventListener('pointercancel', onPointerUp);
			scope.domElement.removeEventListener('wheel', onMouseWheel);

			scope.domElement.removeEventListener('pointermove', onPointerMove);
			scope.domElement.removeEventListener('pointerup', onPointerUp);


			if (scope._domElementKeyEvents !== null) {

				scope._domElementKeyEvents.removeEventListener('keydown', onKeyDown);
				scope._domElementKeyEvents = null;

			}

			//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

		};

		//
		// internals
		//

		const scope = this;

		const STATE = {
			NONE: - 1,
			ROTATE: 0,
			DOLLY: 1,
			PAN: 2,
			TOUCH_ROTATE: 3,
			TOUCH_PAN: 4,
			TOUCH_DOLLY_PAN: 5,
			TOUCH_DOLLY_ROTATE: 6
		};

		let state = STATE.NONE;

		const EPS = 0.000001;

		// current position in spherical coordinates
		const spherical = new Spherical();
		const sphericalDelta = new Spherical();

		let scale = 1;
		const panOffset = new Vector3();
		let zoomChanged = false;

		const rotateStart = new Vector2();
		const rotateEnd = new Vector2();
		const rotateDelta = new Vector2();

		const panStart = new Vector2();
		const panEnd = new Vector2();
		const panDelta = new Vector2();

		const dollyStart = new Vector2();
		const dollyEnd = new Vector2();
		const dollyDelta = new Vector2();

		const pointers = [];
		const pointerPositions = {};

		function getAutoRotationAngle() {

			return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

		}

		function getZoomScale() {

			return Math.pow(0.95, scope.zoomSpeed);

		}

		function rotateLeft(angle) {

			sphericalDelta.theta -= angle;

		}

		function rotateUp(angle) {

			sphericalDelta.phi -= angle;

		}

		const panLeft = function () {

			const v = new Vector3();

			return function panLeft(distance, objectMatrix) {

				v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
				v.multiplyScalar(- distance);

				panOffset.add(v);

			};

		}();

		const panUp = function () {

			const v = new Vector3();

			return function panUp(distance, objectMatrix) {

				if (scope.screenSpacePanning === true) {

					v.setFromMatrixColumn(objectMatrix, 1);

				} else {

					v.setFromMatrixColumn(objectMatrix, 0);
					v.crossVectors(scope.object.up, v);

				}

				v.multiplyScalar(distance);

				panOffset.add(v);

			};

		}();

		// deltaX and deltaY are in pixels; right and down are positive
		const pan = function () {

			const offset = new Vector3();

			return function pan(deltaX, deltaY) {

				const element = scope.domElement;

				if (scope.object.isPerspectiveCamera) {

					// perspective
					const position = scope.object.position;
					offset.copy(position).sub(scope.target);
					let targetDistance = offset.length();

					// half of the fov is center to top of screen
					targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);

					// we use only clientHeight here so aspect ratio does not distort speed
					panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
					panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);

				} else if (scope.object.isOrthographicCamera) {

					// orthographic
					panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
					panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);

				} else {

					// camera neither orthographic nor perspective
					console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
					scope.enablePan = false;

				}

			};

		}();

		function dollyOut(dollyScale) {

			if (scope.object.isPerspectiveCamera) {

				scale /= dollyScale;

			} else if (scope.object.isOrthographicCamera) {

				scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
				scope.object.updateProjectionMatrix();
				zoomChanged = true;

			} else {

				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
				scope.enableZoom = false;

			}

		}

		function dollyIn(dollyScale) {

			if (scope.object.isPerspectiveCamera) {

				scale *= dollyScale;

			} else if (scope.object.isOrthographicCamera) {

				scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
				scope.object.updateProjectionMatrix();
				zoomChanged = true;

			} else {

				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
				scope.enableZoom = false;

			}

		}

		//
		// event callbacks - update the object state
		//

		function handleMouseDownRotate(event) {

			rotateStart.set(event.clientX, event.clientY);

		}

		function handleMouseDownDolly(event) {

			dollyStart.set(event.clientX, event.clientY);

		}

		function handleMouseDownPan(event) {

			panStart.set(event.clientX, event.clientY);

		}

		function handleMouseMoveRotate(event) {

			rotateEnd.set(event.clientX, event.clientY);

			rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

			const element = scope.domElement;

			rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

			rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

			rotateStart.copy(rotateEnd);

			scope.update();

		}

		function handleMouseMoveDolly(event) {

			dollyEnd.set(event.clientX, event.clientY);

			dollyDelta.subVectors(dollyEnd, dollyStart);

			if (dollyDelta.y > 0) {

				dollyOut(getZoomScale());

			} else if (dollyDelta.y < 0) {

				dollyIn(getZoomScale());

			}

			dollyStart.copy(dollyEnd);

			scope.update();

		}

		function handleMouseMovePan(event) {

			panEnd.set(event.clientX, event.clientY);

			panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

			pan(panDelta.x, panDelta.y);

			panStart.copy(panEnd);

			scope.update();

		}

		function handleMouseWheel(event) {

			if (event.deltaY < 0) {

				dollyIn(getZoomScale());

			} else if (event.deltaY > 0) {

				dollyOut(getZoomScale());

			}

			scope.update();

		}

		function handleKeyDown(event) {

			let needsUpdate = false;

			switch (event.code) {

				case scope.keys.UP:

					if (event.ctrlKey || event.metaKey || event.shiftKey) {

						rotateUp(2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight);

					} else {

						pan(0, scope.keyPanSpeed);

					}

					needsUpdate = true;
					break;

				case scope.keys.BOTTOM:

					if (event.ctrlKey || event.metaKey || event.shiftKey) {

						rotateUp(- 2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight);

					} else {

						pan(0, - scope.keyPanSpeed);

					}

					needsUpdate = true;
					break;

				case scope.keys.LEFT:

					if (event.ctrlKey || event.metaKey || event.shiftKey) {

						rotateLeft(2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight);

					} else {

						pan(scope.keyPanSpeed, 0);

					}

					needsUpdate = true;
					break;

				case scope.keys.RIGHT:

					if (event.ctrlKey || event.metaKey || event.shiftKey) {

						rotateLeft(- 2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight);

					} else {

						pan(- scope.keyPanSpeed, 0);

					}

					needsUpdate = true;
					break;

			}

			if (needsUpdate) {

				// prevent the browser from scrolling on cursor keys
				event.preventDefault();

				scope.update();

			}


		}

		function handleTouchStartRotate() {

			if (pointers.length === 1) {

				rotateStart.set(pointers[0].pageX, pointers[0].pageY);

			} else {

				const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
				const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);

				rotateStart.set(x, y);

			}

		}

		function handleTouchStartPan() {

			if (pointers.length === 1) {

				panStart.set(pointers[0].pageX, pointers[0].pageY);

			} else {

				const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
				const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);

				panStart.set(x, y);

			}

		}

		function handleTouchStartDolly() {

			const dx = pointers[0].pageX - pointers[1].pageX;
			const dy = pointers[0].pageY - pointers[1].pageY;

			const distance = Math.sqrt(dx * dx + dy * dy);

			dollyStart.set(0, distance);

		}

		function handleTouchStartDollyPan() {

			if (scope.enableZoom) handleTouchStartDolly();

			if (scope.enablePan) handleTouchStartPan();

		}

		function handleTouchStartDollyRotate() {

			if (scope.enableZoom) handleTouchStartDolly();

			if (scope.enableRotate) handleTouchStartRotate();

		}

		function handleTouchMoveRotate(event) {

			if (pointers.length == 1) {

				rotateEnd.set(event.pageX, event.pageY);

			} else {

				const position = getSecondPointerPosition(event);

				const x = 0.5 * (event.pageX + position.x);
				const y = 0.5 * (event.pageY + position.y);

				rotateEnd.set(x, y);

			}

			rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

			const element = scope.domElement;

			rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

			rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

			rotateStart.copy(rotateEnd);

		}

		function handleTouchMovePan(event) {

			if (pointers.length === 1) {

				panEnd.set(event.pageX, event.pageY);

			} else {

				const position = getSecondPointerPosition(event);

				const x = 0.5 * (event.pageX + position.x);
				const y = 0.5 * (event.pageY + position.y);

				panEnd.set(x, y);

			}

			panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

			pan(panDelta.x, panDelta.y);

			panStart.copy(panEnd);

		}

		function handleTouchMoveDolly(event) {

			const position = getSecondPointerPosition(event);

			const dx = event.pageX - position.x;
			const dy = event.pageY - position.y;

			const distance = Math.sqrt(dx * dx + dy * dy);

			dollyEnd.set(0, distance);

			dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));

			dollyOut(dollyDelta.y);

			dollyStart.copy(dollyEnd);

		}

		function handleTouchMoveDollyPan(event) {

			if (scope.enableZoom) handleTouchMoveDolly(event);

			if (scope.enablePan) handleTouchMovePan(event);

		}

		function handleTouchMoveDollyRotate(event) {

			if (scope.enableZoom) handleTouchMoveDolly(event);

			if (scope.enableRotate) handleTouchMoveRotate(event);

		}

		//
		// event handlers - FSM: listen for events and reset state
		//

		function onPointerDown(event) {

			if (scope.enabled === false) return;

			if (pointers.length === 0) {

				scope.domElement.setPointerCapture(event.pointerId);

				scope.domElement.addEventListener('pointermove', onPointerMove);
				scope.domElement.addEventListener('pointerup', onPointerUp);

			}

			//

			addPointer(event);

			if (event.pointerType === 'touch') {

				onTouchStart(event);

			} else {

				onMouseDown(event);

			}

		}

		function onPointerMove(event) {

			if (scope.enabled === false) return;

			if (event.pointerType === 'touch') {

				onTouchMove(event);

			} else {

				onMouseMove(event);

			}

		}

		function onPointerUp(event) {

			removePointer(event);

			if (pointers.length === 0) {

				scope.domElement.releasePointerCapture(event.pointerId);

				scope.domElement.removeEventListener('pointermove', onPointerMove);
				scope.domElement.removeEventListener('pointerup', onPointerUp);

			}

			scope.dispatchEvent(_endEvent);

			state = STATE.NONE;

		}

		function onMouseDown(event) {

			let mouseAction;

			switch (event.button) {

				case 0:

					mouseAction = scope.mouseButtons.LEFT;
					break;

				case 1:

					mouseAction = scope.mouseButtons.MIDDLE;
					break;

				case 2:

					mouseAction = scope.mouseButtons.RIGHT;
					break;

				default:

					mouseAction = - 1;

			}

			switch (mouseAction) {

				case MOUSE.DOLLY:

					if (scope.enableZoom === false) return;

					handleMouseDownDolly(event);

					state = STATE.DOLLY;

					break;

				case MOUSE.ROTATE:

					if (event.ctrlKey || event.metaKey || event.shiftKey) {

						if (scope.enablePan === false) return;

						handleMouseDownPan(event);

						state = STATE.PAN;

					} else {

						if (scope.enableRotate === false) return;

						handleMouseDownRotate(event);

						state = STATE.ROTATE;

					}

					break;

				case MOUSE.PAN:

					if (event.ctrlKey || event.metaKey || event.shiftKey) {

						if (scope.enableRotate === false) return;

						handleMouseDownRotate(event);

						state = STATE.ROTATE;

					} else {

						if (scope.enablePan === false) return;

						handleMouseDownPan(event);

						state = STATE.PAN;

					}

					break;

				default:

					state = STATE.NONE;

			}

			if (state !== STATE.NONE) {

				scope.dispatchEvent(_startEvent);

			}

		}

		function onMouseMove(event) {

			switch (state) {

				case STATE.ROTATE:

					if (scope.enableRotate === false) return;

					handleMouseMoveRotate(event);

					break;

				case STATE.DOLLY:

					if (scope.enableZoom === false) return;

					handleMouseMoveDolly(event);

					break;

				case STATE.PAN:

					if (scope.enablePan === false) return;

					handleMouseMovePan(event);

					break;

			}

		}

		function onMouseWheel(event) {

			if (scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE) return;

			event.preventDefault();

			scope.dispatchEvent(_startEvent);

			handleMouseWheel(event);

			scope.dispatchEvent(_endEvent);

		}

		function onKeyDown(event) {

			if (scope.enabled === false || scope.enablePan === false) return;

			handleKeyDown(event);

		}

		function onTouchStart(event) {

			trackPointer(event);

			switch (pointers.length) {

				case 1:

					switch (scope.touches.ONE) {

						case TOUCH.ROTATE:

							if (scope.enableRotate === false) return;

							handleTouchStartRotate();

							state = STATE.TOUCH_ROTATE;

							break;

						case TOUCH.PAN:

							if (scope.enablePan === false) return;

							handleTouchStartPan();

							state = STATE.TOUCH_PAN;

							break;

						default:

							state = STATE.NONE;

					}

					break;

				case 2:

					switch (scope.touches.TWO) {

						case TOUCH.DOLLY_PAN:

							if (scope.enableZoom === false && scope.enablePan === false) return;

							handleTouchStartDollyPan();

							state = STATE.TOUCH_DOLLY_PAN;

							break;

						case TOUCH.DOLLY_ROTATE:

							if (scope.enableZoom === false && scope.enableRotate === false) return;

							handleTouchStartDollyRotate();

							state = STATE.TOUCH_DOLLY_ROTATE;

							break;

						default:

							state = STATE.NONE;

					}

					break;

				default:

					state = STATE.NONE;

			}

			if (state !== STATE.NONE) {

				scope.dispatchEvent(_startEvent);

			}

		}

		function onTouchMove(event) {

			trackPointer(event);

			switch (state) {

				case STATE.TOUCH_ROTATE:

					if (scope.enableRotate === false) return;

					handleTouchMoveRotate(event);

					scope.update();

					break;

				case STATE.TOUCH_PAN:

					if (scope.enablePan === false) return;

					handleTouchMovePan(event);

					scope.update();

					break;

				case STATE.TOUCH_DOLLY_PAN:

					if (scope.enableZoom === false && scope.enablePan === false) return;

					handleTouchMoveDollyPan(event);

					scope.update();

					break;

				case STATE.TOUCH_DOLLY_ROTATE:

					if (scope.enableZoom === false && scope.enableRotate === false) return;

					handleTouchMoveDollyRotate(event);

					scope.update();

					break;

				default:

					state = STATE.NONE;

			}

		}

		function onContextMenu(event) {

			if (scope.enabled === false) return;

			event.preventDefault();

		}

		function addPointer(event) {

			pointers.push(event);

		}

		function removePointer(event) {

			delete pointerPositions[event.pointerId];

			for (let i = 0; i < pointers.length; i++) {

				if (pointers[i].pointerId == event.pointerId) {

					pointers.splice(i, 1);
					return;

				}

			}

		}

		function trackPointer(event) {

			let position = pointerPositions[event.pointerId];

			if (position === undefined) {

				position = new Vector2();
				pointerPositions[event.pointerId] = position;

			}

			position.set(event.pageX, event.pageY);

		}

		function getSecondPointerPosition(event) {

			const pointer = (event.pointerId === pointers[0].pointerId) ? pointers[1] : pointers[0];

			return pointerPositions[pointer.pointerId];

		}

		//

		scope.domElement.addEventListener('contextmenu', onContextMenu);

		scope.domElement.addEventListener('pointerdown', onPointerDown);
		scope.domElement.addEventListener('pointercancel', onPointerUp);
		scope.domElement.addEventListener('wheel', onMouseWheel, { passive: false });

		// force an update at start

		this.update();

	}

}

export { OrbitControls };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JiaXRDb250cm9scy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvRXZlbnREaXNwYXRjaGVyLmpzIiwiLi4vc3JjL21hdGgvTWF0aFV0aWxzLmpzIiwiLi4vc3JjL21hdGgvUXVhdGVybmlvbi5qcyIsIi4uL3NyYy9tYXRoL1NwaGVyaWNhbC5qcyIsIi4uL3NyYy9jb25zdGFudHMuanMiLCIuLi9zcmMvbWF0aC9WZWN0b3IyLmpzIiwiLi4vc3JjL21hdGgvVmVjdG9yMy5qcyIsIi4uL2V4YW1wbGVzL2pzbS9jb250cm9scy9PcmJpdENvbnRyb2xzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi9ldmVudGRpc3BhdGNoZXIuanMvXG4gKi9cblxuY2xhc3MgRXZlbnREaXNwYXRjaGVyIHtcblxuXHRhZGRFdmVudExpc3RlbmVyKCB0eXBlLCBsaXN0ZW5lciApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcblxuXHRcdGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblxuXHRcdGlmICggbGlzdGVuZXJzWyB0eXBlIF0gPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0gPSBbXTtcblxuXHRcdH1cblxuXHRcdGlmICggbGlzdGVuZXJzWyB0eXBlIF0uaW5kZXhPZiggbGlzdGVuZXIgKSA9PT0gLSAxICkge1xuXG5cdFx0XHRsaXN0ZW5lcnNbIHR5cGUgXS5wdXNoKCBsaXN0ZW5lciApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRoYXNFdmVudExpc3RlbmVyKCB0eXBlLCBsaXN0ZW5lciApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSByZXR1cm4gZmFsc2U7XG5cblx0XHRjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRyZXR1cm4gbGlzdGVuZXJzWyB0eXBlIF0gIT09IHVuZGVmaW5lZCAmJiBsaXN0ZW5lcnNbIHR5cGUgXS5pbmRleE9mKCBsaXN0ZW5lciApICE9PSAtIDE7XG5cblx0fVxuXG5cdHJlbW92ZUV2ZW50TGlzdGVuZXIoIHR5cGUsIGxpc3RlbmVyICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybjtcblxuXHRcdGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblx0XHRjb25zdCBsaXN0ZW5lckFycmF5ID0gbGlzdGVuZXJzWyB0eXBlIF07XG5cblx0XHRpZiAoIGxpc3RlbmVyQXJyYXkgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0Y29uc3QgaW5kZXggPSBsaXN0ZW5lckFycmF5LmluZGV4T2YoIGxpc3RlbmVyICk7XG5cblx0XHRcdGlmICggaW5kZXggIT09IC0gMSApIHtcblxuXHRcdFx0XHRsaXN0ZW5lckFycmF5LnNwbGljZSggaW5kZXgsIDEgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cblxuXHRkaXNwYXRjaEV2ZW50KCBldmVudCApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSByZXR1cm47XG5cblx0XHRjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cdFx0Y29uc3QgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgZXZlbnQudHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGV2ZW50LnRhcmdldCA9IHRoaXM7XG5cblx0XHRcdC8vIE1ha2UgYSBjb3B5LCBpbiBjYXNlIGxpc3RlbmVycyBhcmUgcmVtb3ZlZCB3aGlsZSBpdGVyYXRpbmcuXG5cdFx0XHRjb25zdCBhcnJheSA9IGxpc3RlbmVyQXJyYXkuc2xpY2UoIDAgKTtcblxuXHRcdFx0Zm9yICggbGV0IGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgaSArKyApIHtcblxuXHRcdFx0XHRhcnJheVsgaSBdLmNhbGwoIHRoaXMsIGV2ZW50ICk7XG5cblx0XHRcdH1cblxuXHRcdFx0ZXZlbnQudGFyZ2V0ID0gbnVsbDtcblxuXHRcdH1cblxuXHR9XG5cbn1cblxuXG5leHBvcnQgeyBFdmVudERpc3BhdGNoZXIgfTtcbiIsImNvbnN0IF9sdXQgPSBbICcwMCcsICcwMScsICcwMicsICcwMycsICcwNCcsICcwNScsICcwNicsICcwNycsICcwOCcsICcwOScsICcwYScsICcwYicsICcwYycsICcwZCcsICcwZScsICcwZicsICcxMCcsICcxMScsICcxMicsICcxMycsICcxNCcsICcxNScsICcxNicsICcxNycsICcxOCcsICcxOScsICcxYScsICcxYicsICcxYycsICcxZCcsICcxZScsICcxZicsICcyMCcsICcyMScsICcyMicsICcyMycsICcyNCcsICcyNScsICcyNicsICcyNycsICcyOCcsICcyOScsICcyYScsICcyYicsICcyYycsICcyZCcsICcyZScsICcyZicsICczMCcsICczMScsICczMicsICczMycsICczNCcsICczNScsICczNicsICczNycsICczOCcsICczOScsICczYScsICczYicsICczYycsICczZCcsICczZScsICczZicsICc0MCcsICc0MScsICc0MicsICc0MycsICc0NCcsICc0NScsICc0NicsICc0NycsICc0OCcsICc0OScsICc0YScsICc0YicsICc0YycsICc0ZCcsICc0ZScsICc0ZicsICc1MCcsICc1MScsICc1MicsICc1MycsICc1NCcsICc1NScsICc1NicsICc1NycsICc1OCcsICc1OScsICc1YScsICc1YicsICc1YycsICc1ZCcsICc1ZScsICc1ZicsICc2MCcsICc2MScsICc2MicsICc2MycsICc2NCcsICc2NScsICc2NicsICc2NycsICc2OCcsICc2OScsICc2YScsICc2YicsICc2YycsICc2ZCcsICc2ZScsICc2ZicsICc3MCcsICc3MScsICc3MicsICc3MycsICc3NCcsICc3NScsICc3NicsICc3NycsICc3OCcsICc3OScsICc3YScsICc3YicsICc3YycsICc3ZCcsICc3ZScsICc3ZicsICc4MCcsICc4MScsICc4MicsICc4MycsICc4NCcsICc4NScsICc4NicsICc4NycsICc4OCcsICc4OScsICc4YScsICc4YicsICc4YycsICc4ZCcsICc4ZScsICc4ZicsICc5MCcsICc5MScsICc5MicsICc5MycsICc5NCcsICc5NScsICc5NicsICc5NycsICc5OCcsICc5OScsICc5YScsICc5YicsICc5YycsICc5ZCcsICc5ZScsICc5ZicsICdhMCcsICdhMScsICdhMicsICdhMycsICdhNCcsICdhNScsICdhNicsICdhNycsICdhOCcsICdhOScsICdhYScsICdhYicsICdhYycsICdhZCcsICdhZScsICdhZicsICdiMCcsICdiMScsICdiMicsICdiMycsICdiNCcsICdiNScsICdiNicsICdiNycsICdiOCcsICdiOScsICdiYScsICdiYicsICdiYycsICdiZCcsICdiZScsICdiZicsICdjMCcsICdjMScsICdjMicsICdjMycsICdjNCcsICdjNScsICdjNicsICdjNycsICdjOCcsICdjOScsICdjYScsICdjYicsICdjYycsICdjZCcsICdjZScsICdjZicsICdkMCcsICdkMScsICdkMicsICdkMycsICdkNCcsICdkNScsICdkNicsICdkNycsICdkOCcsICdkOScsICdkYScsICdkYicsICdkYycsICdkZCcsICdkZScsICdkZicsICdlMCcsICdlMScsICdlMicsICdlMycsICdlNCcsICdlNScsICdlNicsICdlNycsICdlOCcsICdlOScsICdlYScsICdlYicsICdlYycsICdlZCcsICdlZScsICdlZicsICdmMCcsICdmMScsICdmMicsICdmMycsICdmNCcsICdmNScsICdmNicsICdmNycsICdmOCcsICdmOScsICdmYScsICdmYicsICdmYycsICdmZCcsICdmZScsICdmZicgXTtcblxubGV0IF9zZWVkID0gMTIzNDU2NztcblxuXG5jb25zdCBERUcyUkFEID0gTWF0aC5QSSAvIDE4MDtcbmNvbnN0IFJBRDJERUcgPSAxODAgLyBNYXRoLlBJO1xuXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEwNTAzNC9ob3ctdG8tY3JlYXRlLWEtZ3VpZC11dWlkLWluLWphdmFzY3JpcHQvMjE5NjMxMzYjMjE5NjMxMzZcbmZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcblxuXHRjb25zdCBkMCA9IE1hdGgucmFuZG9tKCkgKiAweGZmZmZmZmZmIHwgMDtcblx0Y29uc3QgZDEgPSBNYXRoLnJhbmRvbSgpICogMHhmZmZmZmZmZiB8IDA7XG5cdGNvbnN0IGQyID0gTWF0aC5yYW5kb20oKSAqIDB4ZmZmZmZmZmYgfCAwO1xuXHRjb25zdCBkMyA9IE1hdGgucmFuZG9tKCkgKiAweGZmZmZmZmZmIHwgMDtcblx0Y29uc3QgdXVpZCA9IF9sdXRbIGQwICYgMHhmZiBdICsgX2x1dFsgZDAgPj4gOCAmIDB4ZmYgXSArIF9sdXRbIGQwID4+IDE2ICYgMHhmZiBdICsgX2x1dFsgZDAgPj4gMjQgJiAweGZmIF0gKyAnLScgK1xuXHRcdFx0X2x1dFsgZDEgJiAweGZmIF0gKyBfbHV0WyBkMSA+PiA4ICYgMHhmZiBdICsgJy0nICsgX2x1dFsgZDEgPj4gMTYgJiAweDBmIHwgMHg0MCBdICsgX2x1dFsgZDEgPj4gMjQgJiAweGZmIF0gKyAnLScgK1xuXHRcdFx0X2x1dFsgZDIgJiAweDNmIHwgMHg4MCBdICsgX2x1dFsgZDIgPj4gOCAmIDB4ZmYgXSArICctJyArIF9sdXRbIGQyID4+IDE2ICYgMHhmZiBdICsgX2x1dFsgZDIgPj4gMjQgJiAweGZmIF0gK1xuXHRcdFx0X2x1dFsgZDMgJiAweGZmIF0gKyBfbHV0WyBkMyA+PiA4ICYgMHhmZiBdICsgX2x1dFsgZDMgPj4gMTYgJiAweGZmIF0gKyBfbHV0WyBkMyA+PiAyNCAmIDB4ZmYgXTtcblxuXHQvLyAudG9Mb3dlckNhc2UoKSBoZXJlIGZsYXR0ZW5zIGNvbmNhdGVuYXRlZCBzdHJpbmdzIHRvIHNhdmUgaGVhcCBtZW1vcnkgc3BhY2UuXG5cdHJldHVybiB1dWlkLnRvTG93ZXJDYXNlKCk7XG5cbn1cblxuZnVuY3Rpb24gY2xhbXAoIHZhbHVlLCBtaW4sIG1heCApIHtcblxuXHRyZXR1cm4gTWF0aC5tYXgoIG1pbiwgTWF0aC5taW4oIG1heCwgdmFsdWUgKSApO1xuXG59XG5cbi8vIGNvbXB1dGUgZXVjbGlkZWFuIG1vZHVsbyBvZiBtICUgblxuLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTW9kdWxvX29wZXJhdGlvblxuZnVuY3Rpb24gZXVjbGlkZWFuTW9kdWxvKCBuLCBtICkge1xuXG5cdHJldHVybiAoICggbiAlIG0gKSArIG0gKSAlIG07XG5cbn1cblxuLy8gTGluZWFyIG1hcHBpbmcgZnJvbSByYW5nZSA8YTEsIGEyPiB0byByYW5nZSA8YjEsIGIyPlxuZnVuY3Rpb24gbWFwTGluZWFyKCB4LCBhMSwgYTIsIGIxLCBiMiApIHtcblxuXHRyZXR1cm4gYjEgKyAoIHggLSBhMSApICogKCBiMiAtIGIxICkgLyAoIGEyIC0gYTEgKTtcblxufVxuXG4vLyBodHRwczovL3d3dy5nYW1lZGV2Lm5ldC90dXRvcmlhbHMvcHJvZ3JhbW1pbmcvZ2VuZXJhbC1hbmQtZ2FtZXBsYXktcHJvZ3JhbW1pbmcvaW52ZXJzZS1sZXJwLWEtc3VwZXItdXNlZnVsLXlldC1vZnRlbi1vdmVybG9va2VkLWZ1bmN0aW9uLXI1MjMwL1xuZnVuY3Rpb24gaW52ZXJzZUxlcnAoIHgsIHksIHZhbHVlICkge1xuXG5cdGlmICggeCAhPT0geSApIHtcblxuXHRcdHJldHVybiAoIHZhbHVlIC0geCApIC8gKCB5IC0geCApO1xuXG5cdH0gZWxzZSB7XG5cblx0XHRyZXR1cm4gMDtcblxuXHR9XG5cbn1cblxuLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGluZWFyX2ludGVycG9sYXRpb25cbmZ1bmN0aW9uIGxlcnAoIHgsIHksIHQgKSB7XG5cblx0cmV0dXJuICggMSAtIHQgKSAqIHggKyB0ICogeTtcblxufVxuXG4vLyBodHRwOi8vd3d3LnJvcnlkcmlzY29sbC5jb20vMjAxNi8wMy8wNy9mcmFtZS1yYXRlLWluZGVwZW5kZW50LWRhbXBpbmctdXNpbmctbGVycC9cbmZ1bmN0aW9uIGRhbXAoIHgsIHksIGxhbWJkYSwgZHQgKSB7XG5cblx0cmV0dXJuIGxlcnAoIHgsIHksIDEgLSBNYXRoLmV4cCggLSBsYW1iZGEgKiBkdCApICk7XG5cbn1cblxuLy8gaHR0cHM6Ly93d3cuZGVzbW9zLmNvbS9jYWxjdWxhdG9yL3Zjc2pueXo3eDRcbmZ1bmN0aW9uIHBpbmdwb25nKCB4LCBsZW5ndGggPSAxICkge1xuXG5cdHJldHVybiBsZW5ndGggLSBNYXRoLmFicyggZXVjbGlkZWFuTW9kdWxvKCB4LCBsZW5ndGggKiAyICkgLSBsZW5ndGggKTtcblxufVxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1Ntb290aHN0ZXBcbmZ1bmN0aW9uIHNtb290aHN0ZXAoIHgsIG1pbiwgbWF4ICkge1xuXG5cdGlmICggeCA8PSBtaW4gKSByZXR1cm4gMDtcblx0aWYgKCB4ID49IG1heCApIHJldHVybiAxO1xuXG5cdHggPSAoIHggLSBtaW4gKSAvICggbWF4IC0gbWluICk7XG5cblx0cmV0dXJuIHggKiB4ICogKCAzIC0gMiAqIHggKTtcblxufVxuXG5mdW5jdGlvbiBzbW9vdGhlcnN0ZXAoIHgsIG1pbiwgbWF4ICkge1xuXG5cdGlmICggeCA8PSBtaW4gKSByZXR1cm4gMDtcblx0aWYgKCB4ID49IG1heCApIHJldHVybiAxO1xuXG5cdHggPSAoIHggLSBtaW4gKSAvICggbWF4IC0gbWluICk7XG5cblx0cmV0dXJuIHggKiB4ICogeCAqICggeCAqICggeCAqIDYgLSAxNSApICsgMTAgKTtcblxufVxuXG4vLyBSYW5kb20gaW50ZWdlciBmcm9tIDxsb3csIGhpZ2g+IGludGVydmFsXG5mdW5jdGlvbiByYW5kSW50KCBsb3csIGhpZ2ggKSB7XG5cblx0cmV0dXJuIGxvdyArIE1hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiAoIGhpZ2ggLSBsb3cgKyAxICkgKTtcblxufVxuXG4vLyBSYW5kb20gZmxvYXQgZnJvbSA8bG93LCBoaWdoPiBpbnRlcnZhbFxuZnVuY3Rpb24gcmFuZEZsb2F0KCBsb3csIGhpZ2ggKSB7XG5cblx0cmV0dXJuIGxvdyArIE1hdGgucmFuZG9tKCkgKiAoIGhpZ2ggLSBsb3cgKTtcblxufVxuXG4vLyBSYW5kb20gZmxvYXQgZnJvbSA8LXJhbmdlLzIsIHJhbmdlLzI+IGludGVydmFsXG5mdW5jdGlvbiByYW5kRmxvYXRTcHJlYWQoIHJhbmdlICkge1xuXG5cdHJldHVybiByYW5nZSAqICggMC41IC0gTWF0aC5yYW5kb20oKSApO1xuXG59XG5cbi8vIERldGVybWluaXN0aWMgcHNldWRvLXJhbmRvbSBmbG9hdCBpbiB0aGUgaW50ZXJ2YWwgWyAwLCAxIF1cbmZ1bmN0aW9uIHNlZWRlZFJhbmRvbSggcyApIHtcblxuXHRpZiAoIHMgIT09IHVuZGVmaW5lZCApIF9zZWVkID0gcztcblxuXHQvLyBNdWxiZXJyeTMyIGdlbmVyYXRvclxuXG5cdGxldCB0ID0gX3NlZWQgKz0gMHg2RDJCNzlGNTtcblxuXHR0ID0gTWF0aC5pbXVsKCB0IF4gdCA+Pj4gMTUsIHQgfCAxICk7XG5cblx0dCBePSB0ICsgTWF0aC5pbXVsKCB0IF4gdCA+Pj4gNywgdCB8IDYxICk7XG5cblx0cmV0dXJuICggKCB0IF4gdCA+Pj4gMTQgKSA+Pj4gMCApIC8gNDI5NDk2NzI5NjtcblxufVxuXG5mdW5jdGlvbiBkZWdUb1JhZCggZGVncmVlcyApIHtcblxuXHRyZXR1cm4gZGVncmVlcyAqIERFRzJSQUQ7XG5cbn1cblxuZnVuY3Rpb24gcmFkVG9EZWcoIHJhZGlhbnMgKSB7XG5cblx0cmV0dXJuIHJhZGlhbnMgKiBSQUQyREVHO1xuXG59XG5cbmZ1bmN0aW9uIGlzUG93ZXJPZlR3byggdmFsdWUgKSB7XG5cblx0cmV0dXJuICggdmFsdWUgJiAoIHZhbHVlIC0gMSApICkgPT09IDAgJiYgdmFsdWUgIT09IDA7XG5cbn1cblxuZnVuY3Rpb24gY2VpbFBvd2VyT2ZUd28oIHZhbHVlICkge1xuXG5cdHJldHVybiBNYXRoLnBvdyggMiwgTWF0aC5jZWlsKCBNYXRoLmxvZyggdmFsdWUgKSAvIE1hdGguTE4yICkgKTtcblxufVxuXG5mdW5jdGlvbiBmbG9vclBvd2VyT2ZUd28oIHZhbHVlICkge1xuXG5cdHJldHVybiBNYXRoLnBvdyggMiwgTWF0aC5mbG9vciggTWF0aC5sb2coIHZhbHVlICkgLyBNYXRoLkxOMiApICk7XG5cbn1cblxuZnVuY3Rpb24gc2V0UXVhdGVybmlvbkZyb21Qcm9wZXJFdWxlciggcSwgYSwgYiwgYywgb3JkZXIgKSB7XG5cblx0Ly8gSW50cmluc2ljIFByb3BlciBFdWxlciBBbmdsZXMgLSBzZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRXVsZXJfYW5nbGVzXG5cblx0Ly8gcm90YXRpb25zIGFyZSBhcHBsaWVkIHRvIHRoZSBheGVzIGluIHRoZSBvcmRlciBzcGVjaWZpZWQgYnkgJ29yZGVyJ1xuXHQvLyByb3RhdGlvbiBieSBhbmdsZSAnYScgaXMgYXBwbGllZCBmaXJzdCwgdGhlbiBieSBhbmdsZSAnYicsIHRoZW4gYnkgYW5nbGUgJ2MnXG5cdC8vIGFuZ2xlcyBhcmUgaW4gcmFkaWFuc1xuXG5cdGNvbnN0IGNvcyA9IE1hdGguY29zO1xuXHRjb25zdCBzaW4gPSBNYXRoLnNpbjtcblxuXHRjb25zdCBjMiA9IGNvcyggYiAvIDIgKTtcblx0Y29uc3QgczIgPSBzaW4oIGIgLyAyICk7XG5cblx0Y29uc3QgYzEzID0gY29zKCAoIGEgKyBjICkgLyAyICk7XG5cdGNvbnN0IHMxMyA9IHNpbiggKCBhICsgYyApIC8gMiApO1xuXG5cdGNvbnN0IGMxXzMgPSBjb3MoICggYSAtIGMgKSAvIDIgKTtcblx0Y29uc3QgczFfMyA9IHNpbiggKCBhIC0gYyApIC8gMiApO1xuXG5cdGNvbnN0IGMzXzEgPSBjb3MoICggYyAtIGEgKSAvIDIgKTtcblx0Y29uc3QgczNfMSA9IHNpbiggKCBjIC0gYSApIC8gMiApO1xuXG5cdHN3aXRjaCAoIG9yZGVyICkge1xuXG5cdFx0Y2FzZSAnWFlYJzpcblx0XHRcdHEuc2V0KCBjMiAqIHMxMywgczIgKiBjMV8zLCBzMiAqIHMxXzMsIGMyICogYzEzICk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgJ1laWSc6XG5cdFx0XHRxLnNldCggczIgKiBzMV8zLCBjMiAqIHMxMywgczIgKiBjMV8zLCBjMiAqIGMxMyApO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlICdaWFonOlxuXHRcdFx0cS5zZXQoIHMyICogYzFfMywgczIgKiBzMV8zLCBjMiAqIHMxMywgYzIgKiBjMTMgKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSAnWFpYJzpcblx0XHRcdHEuc2V0KCBjMiAqIHMxMywgczIgKiBzM18xLCBzMiAqIGMzXzEsIGMyICogYzEzICk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgJ1lYWSc6XG5cdFx0XHRxLnNldCggczIgKiBjM18xLCBjMiAqIHMxMywgczIgKiBzM18xLCBjMiAqIGMxMyApO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlICdaWVonOlxuXHRcdFx0cS5zZXQoIHMyICogczNfMSwgczIgKiBjM18xLCBjMiAqIHMxMywgYzIgKiBjMTMgKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdGNvbnNvbGUud2FybiggJ1RIUkVFLk1hdGhVdGlsczogLnNldFF1YXRlcm5pb25Gcm9tUHJvcGVyRXVsZXIoKSBlbmNvdW50ZXJlZCBhbiB1bmtub3duIG9yZGVyOiAnICsgb3JkZXIgKTtcblxuXHR9XG5cbn1cblxuZnVuY3Rpb24gZGVub3JtYWxpemUoIHZhbHVlLCBhcnJheSApIHtcblxuXHRzd2l0Y2ggKCBhcnJheS5jb25zdHJ1Y3RvciApIHtcblxuXHRcdGNhc2UgRmxvYXQzMkFycmF5OlxuXG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cblx0XHRjYXNlIFVpbnQzMkFycmF5OlxuXG5cdFx0XHRyZXR1cm4gdmFsdWUgLyA0Mjk0OTY3Mjk1LjA7XG5cblx0XHRjYXNlIFVpbnQxNkFycmF5OlxuXG5cdFx0XHRyZXR1cm4gdmFsdWUgLyA2NTUzNS4wO1xuXG5cdFx0Y2FzZSBVaW50OEFycmF5OlxuXG5cdFx0XHRyZXR1cm4gdmFsdWUgLyAyNTUuMDtcblxuXHRcdGNhc2UgSW50MzJBcnJheTpcblxuXHRcdFx0cmV0dXJuIE1hdGgubWF4KCB2YWx1ZSAvIDIxNDc0ODM2NDcuMCwgLSAxLjAgKTtcblxuXHRcdGNhc2UgSW50MTZBcnJheTpcblxuXHRcdFx0cmV0dXJuIE1hdGgubWF4KCB2YWx1ZSAvIDMyNzY3LjAsIC0gMS4wICk7XG5cblx0XHRjYXNlIEludDhBcnJheTpcblxuXHRcdFx0cmV0dXJuIE1hdGgubWF4KCB2YWx1ZSAvIDEyNy4wLCAtIDEuMCApO1xuXG5cdFx0ZGVmYXVsdDpcblxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCAnSW52YWxpZCBjb21wb25lbnQgdHlwZS4nICk7XG5cblx0fVxuXG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZSggdmFsdWUsIGFycmF5ICkge1xuXG5cdHN3aXRjaCAoIGFycmF5LmNvbnN0cnVjdG9yICkge1xuXG5cdFx0Y2FzZSBGbG9hdDMyQXJyYXk6XG5cblx0XHRcdHJldHVybiB2YWx1ZTtcblxuXHRcdGNhc2UgVWludDMyQXJyYXk6XG5cblx0XHRcdHJldHVybiBNYXRoLnJvdW5kKCB2YWx1ZSAqIDQyOTQ5NjcyOTUuMCApO1xuXG5cdFx0Y2FzZSBVaW50MTZBcnJheTpcblxuXHRcdFx0cmV0dXJuIE1hdGgucm91bmQoIHZhbHVlICogNjU1MzUuMCApO1xuXG5cdFx0Y2FzZSBVaW50OEFycmF5OlxuXG5cdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCggdmFsdWUgKiAyNTUuMCApO1xuXG5cdFx0Y2FzZSBJbnQzMkFycmF5OlxuXG5cdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCggdmFsdWUgKiAyMTQ3NDgzNjQ3LjAgKTtcblxuXHRcdGNhc2UgSW50MTZBcnJheTpcblxuXHRcdFx0cmV0dXJuIE1hdGgucm91bmQoIHZhbHVlICogMzI3NjcuMCApO1xuXG5cdFx0Y2FzZSBJbnQ4QXJyYXk6XG5cblx0XHRcdHJldHVybiBNYXRoLnJvdW5kKCB2YWx1ZSAqIDEyNy4wICk7XG5cblx0XHRkZWZhdWx0OlxuXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoICdJbnZhbGlkIGNvbXBvbmVudCB0eXBlLicgKTtcblxuXHR9XG5cbn1cblxuY29uc3QgTWF0aFV0aWxzID0ge1xuXHRERUcyUkFEOiBERUcyUkFELFxuXHRSQUQyREVHOiBSQUQyREVHLFxuXHRnZW5lcmF0ZVVVSUQ6IGdlbmVyYXRlVVVJRCxcblx0Y2xhbXA6IGNsYW1wLFxuXHRldWNsaWRlYW5Nb2R1bG86IGV1Y2xpZGVhbk1vZHVsbyxcblx0bWFwTGluZWFyOiBtYXBMaW5lYXIsXG5cdGludmVyc2VMZXJwOiBpbnZlcnNlTGVycCxcblx0bGVycDogbGVycCxcblx0ZGFtcDogZGFtcCxcblx0cGluZ3Bvbmc6IHBpbmdwb25nLFxuXHRzbW9vdGhzdGVwOiBzbW9vdGhzdGVwLFxuXHRzbW9vdGhlcnN0ZXA6IHNtb290aGVyc3RlcCxcblx0cmFuZEludDogcmFuZEludCxcblx0cmFuZEZsb2F0OiByYW5kRmxvYXQsXG5cdHJhbmRGbG9hdFNwcmVhZDogcmFuZEZsb2F0U3ByZWFkLFxuXHRzZWVkZWRSYW5kb206IHNlZWRlZFJhbmRvbSxcblx0ZGVnVG9SYWQ6IGRlZ1RvUmFkLFxuXHRyYWRUb0RlZzogcmFkVG9EZWcsXG5cdGlzUG93ZXJPZlR3bzogaXNQb3dlck9mVHdvLFxuXHRjZWlsUG93ZXJPZlR3bzogY2VpbFBvd2VyT2ZUd28sXG5cdGZsb29yUG93ZXJPZlR3bzogZmxvb3JQb3dlck9mVHdvLFxuXHRzZXRRdWF0ZXJuaW9uRnJvbVByb3BlckV1bGVyOiBzZXRRdWF0ZXJuaW9uRnJvbVByb3BlckV1bGVyLFxuXHRub3JtYWxpemU6IG5vcm1hbGl6ZSxcblx0ZGVub3JtYWxpemU6IGRlbm9ybWFsaXplXG59O1xuXG5leHBvcnQge1xuXHRERUcyUkFELFxuXHRSQUQyREVHLFxuXHRnZW5lcmF0ZVVVSUQsXG5cdGNsYW1wLFxuXHRldWNsaWRlYW5Nb2R1bG8sXG5cdG1hcExpbmVhcixcblx0aW52ZXJzZUxlcnAsXG5cdGxlcnAsXG5cdGRhbXAsXG5cdHBpbmdwb25nLFxuXHRzbW9vdGhzdGVwLFxuXHRzbW9vdGhlcnN0ZXAsXG5cdHJhbmRJbnQsXG5cdHJhbmRGbG9hdCxcblx0cmFuZEZsb2F0U3ByZWFkLFxuXHRzZWVkZWRSYW5kb20sXG5cdGRlZ1RvUmFkLFxuXHRyYWRUb0RlZyxcblx0aXNQb3dlck9mVHdvLFxuXHRjZWlsUG93ZXJPZlR3byxcblx0Zmxvb3JQb3dlck9mVHdvLFxuXHRzZXRRdWF0ZXJuaW9uRnJvbVByb3BlckV1bGVyLFxuXHRub3JtYWxpemUsXG5cdGRlbm9ybWFsaXplLFxuXHRNYXRoVXRpbHNcbn07XG4iLCJpbXBvcnQgKiBhcyBNYXRoVXRpbHMgZnJvbSAnLi9NYXRoVXRpbHMuanMnO1xuXG5jbGFzcyBRdWF0ZXJuaW9uIHtcblxuXHRjb25zdHJ1Y3RvciggeCA9IDAsIHkgPSAwLCB6ID0gMCwgdyA9IDEgKSB7XG5cblx0XHR0aGlzLmlzUXVhdGVybmlvbiA9IHRydWU7XG5cblx0XHR0aGlzLl94ID0geDtcblx0XHR0aGlzLl95ID0geTtcblx0XHR0aGlzLl96ID0gejtcblx0XHR0aGlzLl93ID0gdztcblxuXHR9XG5cblx0c3RhdGljIHNsZXJwRmxhdCggZHN0LCBkc3RPZmZzZXQsIHNyYzAsIHNyY09mZnNldDAsIHNyYzEsIHNyY09mZnNldDEsIHQgKSB7XG5cblx0XHQvLyBmdXp6LWZyZWUsIGFycmF5LWJhc2VkIFF1YXRlcm5pb24gU0xFUlAgb3BlcmF0aW9uXG5cblx0XHRsZXQgeDAgPSBzcmMwWyBzcmNPZmZzZXQwICsgMCBdLFxuXHRcdFx0eTAgPSBzcmMwWyBzcmNPZmZzZXQwICsgMSBdLFxuXHRcdFx0ejAgPSBzcmMwWyBzcmNPZmZzZXQwICsgMiBdLFxuXHRcdFx0dzAgPSBzcmMwWyBzcmNPZmZzZXQwICsgMyBdO1xuXG5cdFx0Y29uc3QgeDEgPSBzcmMxWyBzcmNPZmZzZXQxICsgMCBdLFxuXHRcdFx0eTEgPSBzcmMxWyBzcmNPZmZzZXQxICsgMSBdLFxuXHRcdFx0ejEgPSBzcmMxWyBzcmNPZmZzZXQxICsgMiBdLFxuXHRcdFx0dzEgPSBzcmMxWyBzcmNPZmZzZXQxICsgMyBdO1xuXG5cdFx0aWYgKCB0ID09PSAwICkge1xuXG5cdFx0XHRkc3RbIGRzdE9mZnNldCArIDAgXSA9IHgwO1xuXHRcdFx0ZHN0WyBkc3RPZmZzZXQgKyAxIF0gPSB5MDtcblx0XHRcdGRzdFsgZHN0T2Zmc2V0ICsgMiBdID0gejA7XG5cdFx0XHRkc3RbIGRzdE9mZnNldCArIDMgXSA9IHcwO1xuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB0ID09PSAxICkge1xuXG5cdFx0XHRkc3RbIGRzdE9mZnNldCArIDAgXSA9IHgxO1xuXHRcdFx0ZHN0WyBkc3RPZmZzZXQgKyAxIF0gPSB5MTtcblx0XHRcdGRzdFsgZHN0T2Zmc2V0ICsgMiBdID0gejE7XG5cdFx0XHRkc3RbIGRzdE9mZnNldCArIDMgXSA9IHcxO1xuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB3MCAhPT0gdzEgfHwgeDAgIT09IHgxIHx8IHkwICE9PSB5MSB8fCB6MCAhPT0gejEgKSB7XG5cblx0XHRcdGxldCBzID0gMSAtIHQ7XG5cdFx0XHRjb25zdCBjb3MgPSB4MCAqIHgxICsgeTAgKiB5MSArIHowICogejEgKyB3MCAqIHcxLFxuXHRcdFx0XHRkaXIgPSAoIGNvcyA+PSAwID8gMSA6IC0gMSApLFxuXHRcdFx0XHRzcXJTaW4gPSAxIC0gY29zICogY29zO1xuXG5cdFx0XHQvLyBTa2lwIHRoZSBTbGVycCBmb3IgdGlueSBzdGVwcyB0byBhdm9pZCBudW1lcmljIHByb2JsZW1zOlxuXHRcdFx0aWYgKCBzcXJTaW4gPiBOdW1iZXIuRVBTSUxPTiApIHtcblxuXHRcdFx0XHRjb25zdCBzaW4gPSBNYXRoLnNxcnQoIHNxclNpbiApLFxuXHRcdFx0XHRcdGxlbiA9IE1hdGguYXRhbjIoIHNpbiwgY29zICogZGlyICk7XG5cblx0XHRcdFx0cyA9IE1hdGguc2luKCBzICogbGVuICkgLyBzaW47XG5cdFx0XHRcdHQgPSBNYXRoLnNpbiggdCAqIGxlbiApIC8gc2luO1xuXG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHREaXIgPSB0ICogZGlyO1xuXG5cdFx0XHR4MCA9IHgwICogcyArIHgxICogdERpcjtcblx0XHRcdHkwID0geTAgKiBzICsgeTEgKiB0RGlyO1xuXHRcdFx0ejAgPSB6MCAqIHMgKyB6MSAqIHREaXI7XG5cdFx0XHR3MCA9IHcwICogcyArIHcxICogdERpcjtcblxuXHRcdFx0Ly8gTm9ybWFsaXplIGluIGNhc2Ugd2UganVzdCBkaWQgYSBsZXJwOlxuXHRcdFx0aWYgKCBzID09PSAxIC0gdCApIHtcblxuXHRcdFx0XHRjb25zdCBmID0gMSAvIE1hdGguc3FydCggeDAgKiB4MCArIHkwICogeTAgKyB6MCAqIHowICsgdzAgKiB3MCApO1xuXG5cdFx0XHRcdHgwICo9IGY7XG5cdFx0XHRcdHkwICo9IGY7XG5cdFx0XHRcdHowICo9IGY7XG5cdFx0XHRcdHcwICo9IGY7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGRzdFsgZHN0T2Zmc2V0IF0gPSB4MDtcblx0XHRkc3RbIGRzdE9mZnNldCArIDEgXSA9IHkwO1xuXHRcdGRzdFsgZHN0T2Zmc2V0ICsgMiBdID0gejA7XG5cdFx0ZHN0WyBkc3RPZmZzZXQgKyAzIF0gPSB3MDtcblxuXHR9XG5cblx0c3RhdGljIG11bHRpcGx5UXVhdGVybmlvbnNGbGF0KCBkc3QsIGRzdE9mZnNldCwgc3JjMCwgc3JjT2Zmc2V0MCwgc3JjMSwgc3JjT2Zmc2V0MSApIHtcblxuXHRcdGNvbnN0IHgwID0gc3JjMFsgc3JjT2Zmc2V0MCBdO1xuXHRcdGNvbnN0IHkwID0gc3JjMFsgc3JjT2Zmc2V0MCArIDEgXTtcblx0XHRjb25zdCB6MCA9IHNyYzBbIHNyY09mZnNldDAgKyAyIF07XG5cdFx0Y29uc3QgdzAgPSBzcmMwWyBzcmNPZmZzZXQwICsgMyBdO1xuXG5cdFx0Y29uc3QgeDEgPSBzcmMxWyBzcmNPZmZzZXQxIF07XG5cdFx0Y29uc3QgeTEgPSBzcmMxWyBzcmNPZmZzZXQxICsgMSBdO1xuXHRcdGNvbnN0IHoxID0gc3JjMVsgc3JjT2Zmc2V0MSArIDIgXTtcblx0XHRjb25zdCB3MSA9IHNyYzFbIHNyY09mZnNldDEgKyAzIF07XG5cblx0XHRkc3RbIGRzdE9mZnNldCBdID0geDAgKiB3MSArIHcwICogeDEgKyB5MCAqIHoxIC0gejAgKiB5MTtcblx0XHRkc3RbIGRzdE9mZnNldCArIDEgXSA9IHkwICogdzEgKyB3MCAqIHkxICsgejAgKiB4MSAtIHgwICogejE7XG5cdFx0ZHN0WyBkc3RPZmZzZXQgKyAyIF0gPSB6MCAqIHcxICsgdzAgKiB6MSArIHgwICogeTEgLSB5MCAqIHgxO1xuXHRcdGRzdFsgZHN0T2Zmc2V0ICsgMyBdID0gdzAgKiB3MSAtIHgwICogeDEgLSB5MCAqIHkxIC0gejAgKiB6MTtcblxuXHRcdHJldHVybiBkc3Q7XG5cblx0fVxuXG5cdGdldCB4KCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuX3g7XG5cblx0fVxuXG5cdHNldCB4KCB2YWx1ZSApIHtcblxuXHRcdHRoaXMuX3ggPSB2YWx1ZTtcblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fVxuXG5cdGdldCB5KCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuX3k7XG5cblx0fVxuXG5cdHNldCB5KCB2YWx1ZSApIHtcblxuXHRcdHRoaXMuX3kgPSB2YWx1ZTtcblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fVxuXG5cdGdldCB6KCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuX3o7XG5cblx0fVxuXG5cdHNldCB6KCB2YWx1ZSApIHtcblxuXHRcdHRoaXMuX3ogPSB2YWx1ZTtcblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fVxuXG5cdGdldCB3KCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuX3c7XG5cblx0fVxuXG5cdHNldCB3KCB2YWx1ZSApIHtcblxuXHRcdHRoaXMuX3cgPSB2YWx1ZTtcblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fVxuXG5cdHNldCggeCwgeSwgeiwgdyApIHtcblxuXHRcdHRoaXMuX3ggPSB4O1xuXHRcdHRoaXMuX3kgPSB5O1xuXHRcdHRoaXMuX3ogPSB6O1xuXHRcdHRoaXMuX3cgPSB3O1xuXG5cdFx0dGhpcy5fb25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNsb25lKCkge1xuXG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCB0aGlzLl94LCB0aGlzLl95LCB0aGlzLl96LCB0aGlzLl93ICk7XG5cblx0fVxuXG5cdGNvcHkoIHF1YXRlcm5pb24gKSB7XG5cblx0XHR0aGlzLl94ID0gcXVhdGVybmlvbi54O1xuXHRcdHRoaXMuX3kgPSBxdWF0ZXJuaW9uLnk7XG5cdFx0dGhpcy5feiA9IHF1YXRlcm5pb24uejtcblx0XHR0aGlzLl93ID0gcXVhdGVybmlvbi53O1xuXG5cdFx0dGhpcy5fb25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21FdWxlciggZXVsZXIsIHVwZGF0ZSApIHtcblxuXHRcdGNvbnN0IHggPSBldWxlci5feCwgeSA9IGV1bGVyLl95LCB6ID0gZXVsZXIuX3osIG9yZGVyID0gZXVsZXIuX29yZGVyO1xuXG5cdFx0Ly8gaHR0cDovL3d3dy5tYXRod29ya3MuY29tL21hdGxhYmNlbnRyYWwvZmlsZWV4Y2hhbmdlL1xuXHRcdC8vIFx0MjA2OTYtZnVuY3Rpb24tdG8tY29udmVydC1iZXR3ZWVuLWRjbS1ldWxlci1hbmdsZXMtcXVhdGVybmlvbnMtYW5kLWV1bGVyLXZlY3RvcnMvXG5cdFx0Ly9cdGNvbnRlbnQvU3BpbkNhbGMubVxuXG5cdFx0Y29uc3QgY29zID0gTWF0aC5jb3M7XG5cdFx0Y29uc3Qgc2luID0gTWF0aC5zaW47XG5cblx0XHRjb25zdCBjMSA9IGNvcyggeCAvIDIgKTtcblx0XHRjb25zdCBjMiA9IGNvcyggeSAvIDIgKTtcblx0XHRjb25zdCBjMyA9IGNvcyggeiAvIDIgKTtcblxuXHRcdGNvbnN0IHMxID0gc2luKCB4IC8gMiApO1xuXHRcdGNvbnN0IHMyID0gc2luKCB5IC8gMiApO1xuXHRcdGNvbnN0IHMzID0gc2luKCB6IC8gMiApO1xuXG5cdFx0c3dpdGNoICggb3JkZXIgKSB7XG5cblx0XHRcdGNhc2UgJ1hZWic6XG5cdFx0XHRcdHRoaXMuX3ggPSBzMSAqIGMyICogYzMgKyBjMSAqIHMyICogczM7XG5cdFx0XHRcdHRoaXMuX3kgPSBjMSAqIHMyICogYzMgLSBzMSAqIGMyICogczM7XG5cdFx0XHRcdHRoaXMuX3ogPSBjMSAqIGMyICogczMgKyBzMSAqIHMyICogYzM7XG5cdFx0XHRcdHRoaXMuX3cgPSBjMSAqIGMyICogYzMgLSBzMSAqIHMyICogczM7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdZWFonOlxuXHRcdFx0XHR0aGlzLl94ID0gczEgKiBjMiAqIGMzICsgYzEgKiBzMiAqIHMzO1xuXHRcdFx0XHR0aGlzLl95ID0gYzEgKiBzMiAqIGMzIC0gczEgKiBjMiAqIHMzO1xuXHRcdFx0XHR0aGlzLl96ID0gYzEgKiBjMiAqIHMzIC0gczEgKiBzMiAqIGMzO1xuXHRcdFx0XHR0aGlzLl93ID0gYzEgKiBjMiAqIGMzICsgczEgKiBzMiAqIHMzO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnWlhZJzpcblx0XHRcdFx0dGhpcy5feCA9IHMxICogYzIgKiBjMyAtIGMxICogczIgKiBzMztcblx0XHRcdFx0dGhpcy5feSA9IGMxICogczIgKiBjMyArIHMxICogYzIgKiBzMztcblx0XHRcdFx0dGhpcy5feiA9IGMxICogYzIgKiBzMyArIHMxICogczIgKiBjMztcblx0XHRcdFx0dGhpcy5fdyA9IGMxICogYzIgKiBjMyAtIHMxICogczIgKiBzMztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ1pZWCc6XG5cdFx0XHRcdHRoaXMuX3ggPSBzMSAqIGMyICogYzMgLSBjMSAqIHMyICogczM7XG5cdFx0XHRcdHRoaXMuX3kgPSBjMSAqIHMyICogYzMgKyBzMSAqIGMyICogczM7XG5cdFx0XHRcdHRoaXMuX3ogPSBjMSAqIGMyICogczMgLSBzMSAqIHMyICogYzM7XG5cdFx0XHRcdHRoaXMuX3cgPSBjMSAqIGMyICogYzMgKyBzMSAqIHMyICogczM7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdZWlgnOlxuXHRcdFx0XHR0aGlzLl94ID0gczEgKiBjMiAqIGMzICsgYzEgKiBzMiAqIHMzO1xuXHRcdFx0XHR0aGlzLl95ID0gYzEgKiBzMiAqIGMzICsgczEgKiBjMiAqIHMzO1xuXHRcdFx0XHR0aGlzLl96ID0gYzEgKiBjMiAqIHMzIC0gczEgKiBzMiAqIGMzO1xuXHRcdFx0XHR0aGlzLl93ID0gYzEgKiBjMiAqIGMzIC0gczEgKiBzMiAqIHMzO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnWFpZJzpcblx0XHRcdFx0dGhpcy5feCA9IHMxICogYzIgKiBjMyAtIGMxICogczIgKiBzMztcblx0XHRcdFx0dGhpcy5feSA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcblx0XHRcdFx0dGhpcy5feiA9IGMxICogYzIgKiBzMyArIHMxICogczIgKiBjMztcblx0XHRcdFx0dGhpcy5fdyA9IGMxICogYzIgKiBjMyArIHMxICogczIgKiBzMztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGNvbnNvbGUud2FybiggJ1RIUkVFLlF1YXRlcm5pb246IC5zZXRGcm9tRXVsZXIoKSBlbmNvdW50ZXJlZCBhbiB1bmtub3duIG9yZGVyOiAnICsgb3JkZXIgKTtcblxuXHRcdH1cblxuXHRcdGlmICggdXBkYXRlICE9PSBmYWxzZSApIHRoaXMuX29uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRGcm9tQXhpc0FuZ2xlKCBheGlzLCBhbmdsZSApIHtcblxuXHRcdC8vIGh0dHA6Ly93d3cuZXVjbGlkZWFuc3BhY2UuY29tL21hdGhzL2dlb21ldHJ5L3JvdGF0aW9ucy9jb252ZXJzaW9ucy9hbmdsZVRvUXVhdGVybmlvbi9pbmRleC5odG1cblxuXHRcdC8vIGFzc3VtZXMgYXhpcyBpcyBub3JtYWxpemVkXG5cblx0XHRjb25zdCBoYWxmQW5nbGUgPSBhbmdsZSAvIDIsIHMgPSBNYXRoLnNpbiggaGFsZkFuZ2xlICk7XG5cblx0XHR0aGlzLl94ID0gYXhpcy54ICogcztcblx0XHR0aGlzLl95ID0gYXhpcy55ICogcztcblx0XHR0aGlzLl96ID0gYXhpcy56ICogcztcblx0XHR0aGlzLl93ID0gTWF0aC5jb3MoIGhhbGZBbmdsZSApO1xuXG5cdFx0dGhpcy5fb25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21Sb3RhdGlvbk1hdHJpeCggbSApIHtcblxuXHRcdC8vIGh0dHA6Ly93d3cuZXVjbGlkZWFuc3BhY2UuY29tL21hdGhzL2dlb21ldHJ5L3JvdGF0aW9ucy9jb252ZXJzaW9ucy9tYXRyaXhUb1F1YXRlcm5pb24vaW5kZXguaHRtXG5cblx0XHQvLyBhc3N1bWVzIHRoZSB1cHBlciAzeDMgb2YgbSBpcyBhIHB1cmUgcm90YXRpb24gbWF0cml4IChpLmUsIHVuc2NhbGVkKVxuXG5cdFx0Y29uc3QgdGUgPSBtLmVsZW1lbnRzLFxuXG5cdFx0XHRtMTEgPSB0ZVsgMCBdLCBtMTIgPSB0ZVsgNCBdLCBtMTMgPSB0ZVsgOCBdLFxuXHRcdFx0bTIxID0gdGVbIDEgXSwgbTIyID0gdGVbIDUgXSwgbTIzID0gdGVbIDkgXSxcblx0XHRcdG0zMSA9IHRlWyAyIF0sIG0zMiA9IHRlWyA2IF0sIG0zMyA9IHRlWyAxMCBdLFxuXG5cdFx0XHR0cmFjZSA9IG0xMSArIG0yMiArIG0zMztcblxuXHRcdGlmICggdHJhY2UgPiAwICkge1xuXG5cdFx0XHRjb25zdCBzID0gMC41IC8gTWF0aC5zcXJ0KCB0cmFjZSArIDEuMCApO1xuXG5cdFx0XHR0aGlzLl93ID0gMC4yNSAvIHM7XG5cdFx0XHR0aGlzLl94ID0gKCBtMzIgLSBtMjMgKSAqIHM7XG5cdFx0XHR0aGlzLl95ID0gKCBtMTMgLSBtMzEgKSAqIHM7XG5cdFx0XHR0aGlzLl96ID0gKCBtMjEgLSBtMTIgKSAqIHM7XG5cblx0XHR9IGVsc2UgaWYgKCBtMTEgPiBtMjIgJiYgbTExID4gbTMzICkge1xuXG5cdFx0XHRjb25zdCBzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMTEgLSBtMjIgLSBtMzMgKTtcblxuXHRcdFx0dGhpcy5fdyA9ICggbTMyIC0gbTIzICkgLyBzO1xuXHRcdFx0dGhpcy5feCA9IDAuMjUgKiBzO1xuXHRcdFx0dGhpcy5feSA9ICggbTEyICsgbTIxICkgLyBzO1xuXHRcdFx0dGhpcy5feiA9ICggbTEzICsgbTMxICkgLyBzO1xuXG5cdFx0fSBlbHNlIGlmICggbTIyID4gbTMzICkge1xuXG5cdFx0XHRjb25zdCBzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMjIgLSBtMTEgLSBtMzMgKTtcblxuXHRcdFx0dGhpcy5fdyA9ICggbTEzIC0gbTMxICkgLyBzO1xuXHRcdFx0dGhpcy5feCA9ICggbTEyICsgbTIxICkgLyBzO1xuXHRcdFx0dGhpcy5feSA9IDAuMjUgKiBzO1xuXHRcdFx0dGhpcy5feiA9ICggbTIzICsgbTMyICkgLyBzO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Y29uc3QgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgbTMzIC0gbTExIC0gbTIyICk7XG5cblx0XHRcdHRoaXMuX3cgPSAoIG0yMSAtIG0xMiApIC8gcztcblx0XHRcdHRoaXMuX3ggPSAoIG0xMyArIG0zMSApIC8gcztcblx0XHRcdHRoaXMuX3kgPSAoIG0yMyArIG0zMiApIC8gcztcblx0XHRcdHRoaXMuX3ogPSAwLjI1ICogcztcblxuXHRcdH1cblxuXHRcdHRoaXMuX29uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRGcm9tVW5pdFZlY3RvcnMoIHZGcm9tLCB2VG8gKSB7XG5cblx0XHQvLyBhc3N1bWVzIGRpcmVjdGlvbiB2ZWN0b3JzIHZGcm9tIGFuZCB2VG8gYXJlIG5vcm1hbGl6ZWRcblxuXHRcdGxldCByID0gdkZyb20uZG90KCB2VG8gKSArIDE7XG5cblx0XHRpZiAoIHIgPCBOdW1iZXIuRVBTSUxPTiApIHtcblxuXHRcdFx0Ly8gdkZyb20gYW5kIHZUbyBwb2ludCBpbiBvcHBvc2l0ZSBkaXJlY3Rpb25zXG5cblx0XHRcdHIgPSAwO1xuXG5cdFx0XHRpZiAoIE1hdGguYWJzKCB2RnJvbS54ICkgPiBNYXRoLmFicyggdkZyb20ueiApICkge1xuXG5cdFx0XHRcdHRoaXMuX3ggPSAtIHZGcm9tLnk7XG5cdFx0XHRcdHRoaXMuX3kgPSB2RnJvbS54O1xuXHRcdFx0XHR0aGlzLl96ID0gMDtcblx0XHRcdFx0dGhpcy5fdyA9IHI7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0dGhpcy5feCA9IDA7XG5cdFx0XHRcdHRoaXMuX3kgPSAtIHZGcm9tLno7XG5cdFx0XHRcdHRoaXMuX3ogPSB2RnJvbS55O1xuXHRcdFx0XHR0aGlzLl93ID0gcjtcblxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Ly8gY3Jvc3NWZWN0b3JzKCB2RnJvbSwgdlRvICk7IC8vIGlubGluZWQgdG8gYXZvaWQgY3ljbGljIGRlcGVuZGVuY3kgb24gVmVjdG9yM1xuXG5cdFx0XHR0aGlzLl94ID0gdkZyb20ueSAqIHZUby56IC0gdkZyb20ueiAqIHZUby55O1xuXHRcdFx0dGhpcy5feSA9IHZGcm9tLnogKiB2VG8ueCAtIHZGcm9tLnggKiB2VG8uejtcblx0XHRcdHRoaXMuX3ogPSB2RnJvbS54ICogdlRvLnkgLSB2RnJvbS55ICogdlRvLng7XG5cdFx0XHR0aGlzLl93ID0gcjtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLm5vcm1hbGl6ZSgpO1xuXG5cdH1cblxuXHRhbmdsZVRvKCBxICkge1xuXG5cdFx0cmV0dXJuIDIgKiBNYXRoLmFjb3MoIE1hdGguYWJzKCBNYXRoVXRpbHMuY2xhbXAoIHRoaXMuZG90KCBxICksIC0gMSwgMSApICkgKTtcblxuXHR9XG5cblx0cm90YXRlVG93YXJkcyggcSwgc3RlcCApIHtcblxuXHRcdGNvbnN0IGFuZ2xlID0gdGhpcy5hbmdsZVRvKCBxICk7XG5cblx0XHRpZiAoIGFuZ2xlID09PSAwICkgcmV0dXJuIHRoaXM7XG5cblx0XHRjb25zdCB0ID0gTWF0aC5taW4oIDEsIHN0ZXAgLyBhbmdsZSApO1xuXG5cdFx0dGhpcy5zbGVycCggcSwgdCApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGlkZW50aXR5KCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuc2V0KCAwLCAwLCAwLCAxICk7XG5cblx0fVxuXG5cdGludmVydCgpIHtcblxuXHRcdC8vIHF1YXRlcm5pb24gaXMgYXNzdW1lZCB0byBoYXZlIHVuaXQgbGVuZ3RoXG5cblx0XHRyZXR1cm4gdGhpcy5jb25qdWdhdGUoKTtcblxuXHR9XG5cblx0Y29uanVnYXRlKCkge1xuXG5cdFx0dGhpcy5feCAqPSAtIDE7XG5cdFx0dGhpcy5feSAqPSAtIDE7XG5cdFx0dGhpcy5feiAqPSAtIDE7XG5cblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0ZG90KCB2ICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuX3ggKiB2Ll94ICsgdGhpcy5feSAqIHYuX3kgKyB0aGlzLl96ICogdi5feiArIHRoaXMuX3cgKiB2Ll93O1xuXG5cdH1cblxuXHRsZW5ndGhTcSgpIHtcblxuXHRcdHJldHVybiB0aGlzLl94ICogdGhpcy5feCArIHRoaXMuX3kgKiB0aGlzLl95ICsgdGhpcy5feiAqIHRoaXMuX3ogKyB0aGlzLl93ICogdGhpcy5fdztcblxuXHR9XG5cblx0bGVuZ3RoKCkge1xuXG5cdFx0cmV0dXJuIE1hdGguc3FydCggdGhpcy5feCAqIHRoaXMuX3ggKyB0aGlzLl95ICogdGhpcy5feSArIHRoaXMuX3ogKiB0aGlzLl96ICsgdGhpcy5fdyAqIHRoaXMuX3cgKTtcblxuXHR9XG5cblx0bm9ybWFsaXplKCkge1xuXG5cdFx0bGV0IGwgPSB0aGlzLmxlbmd0aCgpO1xuXG5cdFx0aWYgKCBsID09PSAwICkge1xuXG5cdFx0XHR0aGlzLl94ID0gMDtcblx0XHRcdHRoaXMuX3kgPSAwO1xuXHRcdFx0dGhpcy5feiA9IDA7XG5cdFx0XHR0aGlzLl93ID0gMTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGwgPSAxIC8gbDtcblxuXHRcdFx0dGhpcy5feCA9IHRoaXMuX3ggKiBsO1xuXHRcdFx0dGhpcy5feSA9IHRoaXMuX3kgKiBsO1xuXHRcdFx0dGhpcy5feiA9IHRoaXMuX3ogKiBsO1xuXHRcdFx0dGhpcy5fdyA9IHRoaXMuX3cgKiBsO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5fb25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG11bHRpcGx5KCBxICkge1xuXG5cdFx0cmV0dXJuIHRoaXMubXVsdGlwbHlRdWF0ZXJuaW9ucyggdGhpcywgcSApO1xuXG5cdH1cblxuXHRwcmVtdWx0aXBseSggcSApIHtcblxuXHRcdHJldHVybiB0aGlzLm11bHRpcGx5UXVhdGVybmlvbnMoIHEsIHRoaXMgKTtcblxuXHR9XG5cblx0bXVsdGlwbHlRdWF0ZXJuaW9ucyggYSwgYiApIHtcblxuXHRcdC8vIGZyb20gaHR0cDovL3d3dy5ldWNsaWRlYW5zcGFjZS5jb20vbWF0aHMvYWxnZWJyYS9yZWFsTm9ybWVkQWxnZWJyYS9xdWF0ZXJuaW9ucy9jb2RlL2luZGV4Lmh0bVxuXG5cdFx0Y29uc3QgcWF4ID0gYS5feCwgcWF5ID0gYS5feSwgcWF6ID0gYS5feiwgcWF3ID0gYS5fdztcblx0XHRjb25zdCBxYnggPSBiLl94LCBxYnkgPSBiLl95LCBxYnogPSBiLl96LCBxYncgPSBiLl93O1xuXG5cdFx0dGhpcy5feCA9IHFheCAqIHFidyArIHFhdyAqIHFieCArIHFheSAqIHFieiAtIHFheiAqIHFieTtcblx0XHR0aGlzLl95ID0gcWF5ICogcWJ3ICsgcWF3ICogcWJ5ICsgcWF6ICogcWJ4IC0gcWF4ICogcWJ6O1xuXHRcdHRoaXMuX3ogPSBxYXogKiBxYncgKyBxYXcgKiBxYnogKyBxYXggKiBxYnkgLSBxYXkgKiBxYng7XG5cdFx0dGhpcy5fdyA9IHFhdyAqIHFidyAtIHFheCAqIHFieCAtIHFheSAqIHFieSAtIHFheiAqIHFiejtcblxuXHRcdHRoaXMuX29uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzbGVycCggcWIsIHQgKSB7XG5cblx0XHRpZiAoIHQgPT09IDAgKSByZXR1cm4gdGhpcztcblx0XHRpZiAoIHQgPT09IDEgKSByZXR1cm4gdGhpcy5jb3B5KCBxYiApO1xuXG5cdFx0Y29uc3QgeCA9IHRoaXMuX3gsIHkgPSB0aGlzLl95LCB6ID0gdGhpcy5feiwgdyA9IHRoaXMuX3c7XG5cblx0XHQvLyBodHRwOi8vd3d3LmV1Y2xpZGVhbnNwYWNlLmNvbS9tYXRocy9hbGdlYnJhL3JlYWxOb3JtZWRBbGdlYnJhL3F1YXRlcm5pb25zL3NsZXJwL1xuXG5cdFx0bGV0IGNvc0hhbGZUaGV0YSA9IHcgKiBxYi5fdyArIHggKiBxYi5feCArIHkgKiBxYi5feSArIHogKiBxYi5fejtcblxuXHRcdGlmICggY29zSGFsZlRoZXRhIDwgMCApIHtcblxuXHRcdFx0dGhpcy5fdyA9IC0gcWIuX3c7XG5cdFx0XHR0aGlzLl94ID0gLSBxYi5feDtcblx0XHRcdHRoaXMuX3kgPSAtIHFiLl95O1xuXHRcdFx0dGhpcy5feiA9IC0gcWIuX3o7XG5cblx0XHRcdGNvc0hhbGZUaGV0YSA9IC0gY29zSGFsZlRoZXRhO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dGhpcy5jb3B5KCBxYiApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBjb3NIYWxmVGhldGEgPj0gMS4wICkge1xuXG5cdFx0XHR0aGlzLl93ID0gdztcblx0XHRcdHRoaXMuX3ggPSB4O1xuXHRcdFx0dGhpcy5feSA9IHk7XG5cdFx0XHR0aGlzLl96ID0gejtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHR9XG5cblx0XHRjb25zdCBzcXJTaW5IYWxmVGhldGEgPSAxLjAgLSBjb3NIYWxmVGhldGEgKiBjb3NIYWxmVGhldGE7XG5cblx0XHRpZiAoIHNxclNpbkhhbGZUaGV0YSA8PSBOdW1iZXIuRVBTSUxPTiApIHtcblxuXHRcdFx0Y29uc3QgcyA9IDEgLSB0O1xuXHRcdFx0dGhpcy5fdyA9IHMgKiB3ICsgdCAqIHRoaXMuX3c7XG5cdFx0XHR0aGlzLl94ID0gcyAqIHggKyB0ICogdGhpcy5feDtcblx0XHRcdHRoaXMuX3kgPSBzICogeSArIHQgKiB0aGlzLl95O1xuXHRcdFx0dGhpcy5feiA9IHMgKiB6ICsgdCAqIHRoaXMuX3o7XG5cblx0XHRcdHRoaXMubm9ybWFsaXplKCk7XG5cdFx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2luSGFsZlRoZXRhID0gTWF0aC5zcXJ0KCBzcXJTaW5IYWxmVGhldGEgKTtcblx0XHRjb25zdCBoYWxmVGhldGEgPSBNYXRoLmF0YW4yKCBzaW5IYWxmVGhldGEsIGNvc0hhbGZUaGV0YSApO1xuXHRcdGNvbnN0IHJhdGlvQSA9IE1hdGguc2luKCAoIDEgLSB0ICkgKiBoYWxmVGhldGEgKSAvIHNpbkhhbGZUaGV0YSxcblx0XHRcdHJhdGlvQiA9IE1hdGguc2luKCB0ICogaGFsZlRoZXRhICkgLyBzaW5IYWxmVGhldGE7XG5cblx0XHR0aGlzLl93ID0gKCB3ICogcmF0aW9BICsgdGhpcy5fdyAqIHJhdGlvQiApO1xuXHRcdHRoaXMuX3ggPSAoIHggKiByYXRpb0EgKyB0aGlzLl94ICogcmF0aW9CICk7XG5cdFx0dGhpcy5feSA9ICggeSAqIHJhdGlvQSArIHRoaXMuX3kgKiByYXRpb0IgKTtcblx0XHR0aGlzLl96ID0gKCB6ICogcmF0aW9BICsgdGhpcy5feiAqIHJhdGlvQiApO1xuXG5cdFx0dGhpcy5fb25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNsZXJwUXVhdGVybmlvbnMoIHFhLCBxYiwgdCApIHtcblxuXHRcdHJldHVybiB0aGlzLmNvcHkoIHFhICkuc2xlcnAoIHFiLCB0ICk7XG5cblx0fVxuXG5cdHJhbmRvbSgpIHtcblxuXHRcdC8vIERlcml2ZWQgZnJvbSBodHRwOi8vcGxhbm5pbmcuY3MudWl1Yy5lZHUvbm9kZTE5OC5odG1sXG5cdFx0Ly8gTm90ZSwgdGhpcyBzb3VyY2UgdXNlcyB3LCB4LCB5LCB6IG9yZGVyaW5nLFxuXHRcdC8vIHNvIHdlIHN3YXAgdGhlIG9yZGVyIGJlbG93LlxuXG5cdFx0Y29uc3QgdTEgPSBNYXRoLnJhbmRvbSgpO1xuXHRcdGNvbnN0IHNxcnQxdTEgPSBNYXRoLnNxcnQoIDEgLSB1MSApO1xuXHRcdGNvbnN0IHNxcnR1MSA9IE1hdGguc3FydCggdTEgKTtcblxuXHRcdGNvbnN0IHUyID0gMiAqIE1hdGguUEkgKiBNYXRoLnJhbmRvbSgpO1xuXG5cdFx0Y29uc3QgdTMgPSAyICogTWF0aC5QSSAqIE1hdGgucmFuZG9tKCk7XG5cblx0XHRyZXR1cm4gdGhpcy5zZXQoXG5cdFx0XHRzcXJ0MXUxICogTWF0aC5jb3MoIHUyICksXG5cdFx0XHRzcXJ0dTEgKiBNYXRoLnNpbiggdTMgKSxcblx0XHRcdHNxcnR1MSAqIE1hdGguY29zKCB1MyApLFxuXHRcdFx0c3FydDF1MSAqIE1hdGguc2luKCB1MiApLFxuXHRcdCk7XG5cblx0fVxuXG5cdGVxdWFscyggcXVhdGVybmlvbiApIHtcblxuXHRcdHJldHVybiAoIHF1YXRlcm5pb24uX3ggPT09IHRoaXMuX3ggKSAmJiAoIHF1YXRlcm5pb24uX3kgPT09IHRoaXMuX3kgKSAmJiAoIHF1YXRlcm5pb24uX3ogPT09IHRoaXMuX3ogKSAmJiAoIHF1YXRlcm5pb24uX3cgPT09IHRoaXMuX3cgKTtcblxuXHR9XG5cblx0ZnJvbUFycmF5KCBhcnJheSwgb2Zmc2V0ID0gMCApIHtcblxuXHRcdHRoaXMuX3ggPSBhcnJheVsgb2Zmc2V0IF07XG5cdFx0dGhpcy5feSA9IGFycmF5WyBvZmZzZXQgKyAxIF07XG5cdFx0dGhpcy5feiA9IGFycmF5WyBvZmZzZXQgKyAyIF07XG5cdFx0dGhpcy5fdyA9IGFycmF5WyBvZmZzZXQgKyAzIF07XG5cblx0XHR0aGlzLl9vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0dG9BcnJheSggYXJyYXkgPSBbXSwgb2Zmc2V0ID0gMCApIHtcblxuXHRcdGFycmF5WyBvZmZzZXQgXSA9IHRoaXMuX3g7XG5cdFx0YXJyYXlbIG9mZnNldCArIDEgXSA9IHRoaXMuX3k7XG5cdFx0YXJyYXlbIG9mZnNldCArIDIgXSA9IHRoaXMuX3o7XG5cdFx0YXJyYXlbIG9mZnNldCArIDMgXSA9IHRoaXMuX3c7XG5cblx0XHRyZXR1cm4gYXJyYXk7XG5cblx0fVxuXG5cdGZyb21CdWZmZXJBdHRyaWJ1dGUoIGF0dHJpYnV0ZSwgaW5kZXggKSB7XG5cblx0XHR0aGlzLl94ID0gYXR0cmlidXRlLmdldFgoIGluZGV4ICk7XG5cdFx0dGhpcy5feSA9IGF0dHJpYnV0ZS5nZXRZKCBpbmRleCApO1xuXHRcdHRoaXMuX3ogPSBhdHRyaWJ1dGUuZ2V0WiggaW5kZXggKTtcblx0XHR0aGlzLl93ID0gYXR0cmlidXRlLmdldFcoIGluZGV4ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0dG9KU09OKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMudG9BcnJheSgpO1xuXG5cdH1cblxuXHRfb25DaGFuZ2UoIGNhbGxiYWNrICkge1xuXG5cdFx0dGhpcy5fb25DaGFuZ2VDYWxsYmFjayA9IGNhbGxiYWNrO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdF9vbkNoYW5nZUNhbGxiYWNrKCkge31cblxuXHQqWyBTeW1ib2wuaXRlcmF0b3IgXSgpIHtcblxuXHRcdHlpZWxkIHRoaXMuX3g7XG5cdFx0eWllbGQgdGhpcy5feTtcblx0XHR5aWVsZCB0aGlzLl96O1xuXHRcdHlpZWxkIHRoaXMuX3c7XG5cblx0fVxuXG59XG5cbmV4cG9ydCB7IFF1YXRlcm5pb24gfTtcbiIsIi8qKlxuICogUmVmOiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TcGhlcmljYWxfY29vcmRpbmF0ZV9zeXN0ZW1cbiAqXG4gKiBUaGUgcG9sYXIgYW5nbGUgKHBoaSkgaXMgbWVhc3VyZWQgZnJvbSB0aGUgcG9zaXRpdmUgeS1heGlzLiBUaGUgcG9zaXRpdmUgeS1heGlzIGlzIHVwLlxuICogVGhlIGF6aW11dGhhbCBhbmdsZSAodGhldGEpIGlzIG1lYXN1cmVkIGZyb20gdGhlIHBvc2l0aXZlIHotYXhpcy5cbiAqL1xuXG5pbXBvcnQgKiBhcyBNYXRoVXRpbHMgZnJvbSAnLi9NYXRoVXRpbHMuanMnO1xuXG5jbGFzcyBTcGhlcmljYWwge1xuXG5cdGNvbnN0cnVjdG9yKCByYWRpdXMgPSAxLCBwaGkgPSAwLCB0aGV0YSA9IDAgKSB7XG5cblx0XHR0aGlzLnJhZGl1cyA9IHJhZGl1cztcblx0XHR0aGlzLnBoaSA9IHBoaTsgLy8gcG9sYXIgYW5nbGVcblx0XHR0aGlzLnRoZXRhID0gdGhldGE7IC8vIGF6aW11dGhhbCBhbmdsZVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldCggcmFkaXVzLCBwaGksIHRoZXRhICkge1xuXG5cdFx0dGhpcy5yYWRpdXMgPSByYWRpdXM7XG5cdFx0dGhpcy5waGkgPSBwaGk7XG5cdFx0dGhpcy50aGV0YSA9IHRoZXRhO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNvcHkoIG90aGVyICkge1xuXG5cdFx0dGhpcy5yYWRpdXMgPSBvdGhlci5yYWRpdXM7XG5cdFx0dGhpcy5waGkgPSBvdGhlci5waGk7XG5cdFx0dGhpcy50aGV0YSA9IG90aGVyLnRoZXRhO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8vIHJlc3RyaWN0IHBoaSB0byBiZSBiZXR3ZWVuIEVQUyBhbmQgUEktRVBTXG5cdG1ha2VTYWZlKCkge1xuXG5cdFx0Y29uc3QgRVBTID0gMC4wMDAwMDE7XG5cdFx0dGhpcy5waGkgPSBNYXRoLm1heCggRVBTLCBNYXRoLm1pbiggTWF0aC5QSSAtIEVQUywgdGhpcy5waGkgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21WZWN0b3IzKCB2ICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuc2V0RnJvbUNhcnRlc2lhbkNvb3Jkcyggdi54LCB2LnksIHYueiApO1xuXG5cdH1cblxuXHRzZXRGcm9tQ2FydGVzaWFuQ29vcmRzKCB4LCB5LCB6ICkge1xuXG5cdFx0dGhpcy5yYWRpdXMgPSBNYXRoLnNxcnQoIHggKiB4ICsgeSAqIHkgKyB6ICogeiApO1xuXG5cdFx0aWYgKCB0aGlzLnJhZGl1cyA9PT0gMCApIHtcblxuXHRcdFx0dGhpcy50aGV0YSA9IDA7XG5cdFx0XHR0aGlzLnBoaSA9IDA7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR0aGlzLnRoZXRhID0gTWF0aC5hdGFuMiggeCwgeiApO1xuXHRcdFx0dGhpcy5waGkgPSBNYXRoLmFjb3MoIE1hdGhVdGlscy5jbGFtcCggeSAvIHRoaXMucmFkaXVzLCAtIDEsIDEgKSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNsb25lKCkge1xuXG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCkuY29weSggdGhpcyApO1xuXG5cdH1cblxufVxuXG5leHBvcnQgeyBTcGhlcmljYWwgfTtcbiIsImV4cG9ydCBjb25zdCBSRVZJU0lPTiA9ICcxNTQnO1xuXG5leHBvcnQgY29uc3QgTU9VU0UgPSB7IExFRlQ6IDAsIE1JRERMRTogMSwgUklHSFQ6IDIsIFJPVEFURTogMCwgRE9MTFk6IDEsIFBBTjogMiB9O1xuZXhwb3J0IGNvbnN0IFRPVUNIID0geyBST1RBVEU6IDAsIFBBTjogMSwgRE9MTFlfUEFOOiAyLCBET0xMWV9ST1RBVEU6IDMgfTtcbmV4cG9ydCBjb25zdCBDdWxsRmFjZU5vbmUgPSAwO1xuZXhwb3J0IGNvbnN0IEN1bGxGYWNlQmFjayA9IDE7XG5leHBvcnQgY29uc3QgQ3VsbEZhY2VGcm9udCA9IDI7XG5leHBvcnQgY29uc3QgQ3VsbEZhY2VGcm9udEJhY2sgPSAzO1xuZXhwb3J0IGNvbnN0IEJhc2ljU2hhZG93TWFwID0gMDtcbmV4cG9ydCBjb25zdCBQQ0ZTaGFkb3dNYXAgPSAxO1xuZXhwb3J0IGNvbnN0IFBDRlNvZnRTaGFkb3dNYXAgPSAyO1xuZXhwb3J0IGNvbnN0IFZTTVNoYWRvd01hcCA9IDM7XG5leHBvcnQgY29uc3QgRnJvbnRTaWRlID0gMDtcbmV4cG9ydCBjb25zdCBCYWNrU2lkZSA9IDE7XG5leHBvcnQgY29uc3QgRG91YmxlU2lkZSA9IDI7XG5leHBvcnQgY29uc3QgVHdvUGFzc0RvdWJsZVNpZGUgPSAyOyAvLyByMTQ5XG5leHBvcnQgY29uc3QgTm9CbGVuZGluZyA9IDA7XG5leHBvcnQgY29uc3QgTm9ybWFsQmxlbmRpbmcgPSAxO1xuZXhwb3J0IGNvbnN0IEFkZGl0aXZlQmxlbmRpbmcgPSAyO1xuZXhwb3J0IGNvbnN0IFN1YnRyYWN0aXZlQmxlbmRpbmcgPSAzO1xuZXhwb3J0IGNvbnN0IE11bHRpcGx5QmxlbmRpbmcgPSA0O1xuZXhwb3J0IGNvbnN0IEN1c3RvbUJsZW5kaW5nID0gNTtcbmV4cG9ydCBjb25zdCBBZGRFcXVhdGlvbiA9IDEwMDtcbmV4cG9ydCBjb25zdCBTdWJ0cmFjdEVxdWF0aW9uID0gMTAxO1xuZXhwb3J0IGNvbnN0IFJldmVyc2VTdWJ0cmFjdEVxdWF0aW9uID0gMTAyO1xuZXhwb3J0IGNvbnN0IE1pbkVxdWF0aW9uID0gMTAzO1xuZXhwb3J0IGNvbnN0IE1heEVxdWF0aW9uID0gMTA0O1xuZXhwb3J0IGNvbnN0IFplcm9GYWN0b3IgPSAyMDA7XG5leHBvcnQgY29uc3QgT25lRmFjdG9yID0gMjAxO1xuZXhwb3J0IGNvbnN0IFNyY0NvbG9yRmFjdG9yID0gMjAyO1xuZXhwb3J0IGNvbnN0IE9uZU1pbnVzU3JjQ29sb3JGYWN0b3IgPSAyMDM7XG5leHBvcnQgY29uc3QgU3JjQWxwaGFGYWN0b3IgPSAyMDQ7XG5leHBvcnQgY29uc3QgT25lTWludXNTcmNBbHBoYUZhY3RvciA9IDIwNTtcbmV4cG9ydCBjb25zdCBEc3RBbHBoYUZhY3RvciA9IDIwNjtcbmV4cG9ydCBjb25zdCBPbmVNaW51c0RzdEFscGhhRmFjdG9yID0gMjA3O1xuZXhwb3J0IGNvbnN0IERzdENvbG9yRmFjdG9yID0gMjA4O1xuZXhwb3J0IGNvbnN0IE9uZU1pbnVzRHN0Q29sb3JGYWN0b3IgPSAyMDk7XG5leHBvcnQgY29uc3QgU3JjQWxwaGFTYXR1cmF0ZUZhY3RvciA9IDIxMDtcbmV4cG9ydCBjb25zdCBOZXZlckRlcHRoID0gMDtcbmV4cG9ydCBjb25zdCBBbHdheXNEZXB0aCA9IDE7XG5leHBvcnQgY29uc3QgTGVzc0RlcHRoID0gMjtcbmV4cG9ydCBjb25zdCBMZXNzRXF1YWxEZXB0aCA9IDM7XG5leHBvcnQgY29uc3QgRXF1YWxEZXB0aCA9IDQ7XG5leHBvcnQgY29uc3QgR3JlYXRlckVxdWFsRGVwdGggPSA1O1xuZXhwb3J0IGNvbnN0IEdyZWF0ZXJEZXB0aCA9IDY7XG5leHBvcnQgY29uc3QgTm90RXF1YWxEZXB0aCA9IDc7XG5leHBvcnQgY29uc3QgTXVsdGlwbHlPcGVyYXRpb24gPSAwO1xuZXhwb3J0IGNvbnN0IE1peE9wZXJhdGlvbiA9IDE7XG5leHBvcnQgY29uc3QgQWRkT3BlcmF0aW9uID0gMjtcbmV4cG9ydCBjb25zdCBOb1RvbmVNYXBwaW5nID0gMDtcbmV4cG9ydCBjb25zdCBMaW5lYXJUb25lTWFwcGluZyA9IDE7XG5leHBvcnQgY29uc3QgUmVpbmhhcmRUb25lTWFwcGluZyA9IDI7XG5leHBvcnQgY29uc3QgQ2luZW9uVG9uZU1hcHBpbmcgPSAzO1xuZXhwb3J0IGNvbnN0IEFDRVNGaWxtaWNUb25lTWFwcGluZyA9IDQ7XG5leHBvcnQgY29uc3QgQ3VzdG9tVG9uZU1hcHBpbmcgPSA1O1xuXG5leHBvcnQgY29uc3QgVVZNYXBwaW5nID0gMzAwO1xuZXhwb3J0IGNvbnN0IEN1YmVSZWZsZWN0aW9uTWFwcGluZyA9IDMwMTtcbmV4cG9ydCBjb25zdCBDdWJlUmVmcmFjdGlvbk1hcHBpbmcgPSAzMDI7XG5leHBvcnQgY29uc3QgRXF1aXJlY3Rhbmd1bGFyUmVmbGVjdGlvbk1hcHBpbmcgPSAzMDM7XG5leHBvcnQgY29uc3QgRXF1aXJlY3Rhbmd1bGFyUmVmcmFjdGlvbk1hcHBpbmcgPSAzMDQ7XG5leHBvcnQgY29uc3QgQ3ViZVVWUmVmbGVjdGlvbk1hcHBpbmcgPSAzMDY7XG5leHBvcnQgY29uc3QgUmVwZWF0V3JhcHBpbmcgPSAxMDAwO1xuZXhwb3J0IGNvbnN0IENsYW1wVG9FZGdlV3JhcHBpbmcgPSAxMDAxO1xuZXhwb3J0IGNvbnN0IE1pcnJvcmVkUmVwZWF0V3JhcHBpbmcgPSAxMDAyO1xuZXhwb3J0IGNvbnN0IE5lYXJlc3RGaWx0ZXIgPSAxMDAzO1xuZXhwb3J0IGNvbnN0IE5lYXJlc3RNaXBtYXBOZWFyZXN0RmlsdGVyID0gMTAwNDtcbmV4cG9ydCBjb25zdCBOZWFyZXN0TWlwTWFwTmVhcmVzdEZpbHRlciA9IDEwMDQ7XG5leHBvcnQgY29uc3QgTmVhcmVzdE1pcG1hcExpbmVhckZpbHRlciA9IDEwMDU7XG5leHBvcnQgY29uc3QgTmVhcmVzdE1pcE1hcExpbmVhckZpbHRlciA9IDEwMDU7XG5leHBvcnQgY29uc3QgTGluZWFyRmlsdGVyID0gMTAwNjtcbmV4cG9ydCBjb25zdCBMaW5lYXJNaXBtYXBOZWFyZXN0RmlsdGVyID0gMTAwNztcbmV4cG9ydCBjb25zdCBMaW5lYXJNaXBNYXBOZWFyZXN0RmlsdGVyID0gMTAwNztcbmV4cG9ydCBjb25zdCBMaW5lYXJNaXBtYXBMaW5lYXJGaWx0ZXIgPSAxMDA4O1xuZXhwb3J0IGNvbnN0IExpbmVhck1pcE1hcExpbmVhckZpbHRlciA9IDEwMDg7XG5leHBvcnQgY29uc3QgVW5zaWduZWRCeXRlVHlwZSA9IDEwMDk7XG5leHBvcnQgY29uc3QgQnl0ZVR5cGUgPSAxMDEwO1xuZXhwb3J0IGNvbnN0IFNob3J0VHlwZSA9IDEwMTE7XG5leHBvcnQgY29uc3QgVW5zaWduZWRTaG9ydFR5cGUgPSAxMDEyO1xuZXhwb3J0IGNvbnN0IEludFR5cGUgPSAxMDEzO1xuZXhwb3J0IGNvbnN0IFVuc2lnbmVkSW50VHlwZSA9IDEwMTQ7XG5leHBvcnQgY29uc3QgRmxvYXRUeXBlID0gMTAxNTtcbmV4cG9ydCBjb25zdCBIYWxmRmxvYXRUeXBlID0gMTAxNjtcbmV4cG9ydCBjb25zdCBVbnNpZ25lZFNob3J0NDQ0NFR5cGUgPSAxMDE3O1xuZXhwb3J0IGNvbnN0IFVuc2lnbmVkU2hvcnQ1NTUxVHlwZSA9IDEwMTg7XG5leHBvcnQgY29uc3QgVW5zaWduZWRJbnQyNDhUeXBlID0gMTAyMDtcbmV4cG9ydCBjb25zdCBBbHBoYUZvcm1hdCA9IDEwMjE7XG5leHBvcnQgY29uc3QgUkdCQUZvcm1hdCA9IDEwMjM7XG5leHBvcnQgY29uc3QgTHVtaW5hbmNlRm9ybWF0ID0gMTAyNDtcbmV4cG9ydCBjb25zdCBMdW1pbmFuY2VBbHBoYUZvcm1hdCA9IDEwMjU7XG5leHBvcnQgY29uc3QgRGVwdGhGb3JtYXQgPSAxMDI2O1xuZXhwb3J0IGNvbnN0IERlcHRoU3RlbmNpbEZvcm1hdCA9IDEwMjc7XG5leHBvcnQgY29uc3QgUmVkRm9ybWF0ID0gMTAyODtcbmV4cG9ydCBjb25zdCBSZWRJbnRlZ2VyRm9ybWF0ID0gMTAyOTtcbmV4cG9ydCBjb25zdCBSR0Zvcm1hdCA9IDEwMzA7XG5leHBvcnQgY29uc3QgUkdJbnRlZ2VyRm9ybWF0ID0gMTAzMTtcbmV4cG9ydCBjb25zdCBSR0JBSW50ZWdlckZvcm1hdCA9IDEwMzM7XG5cbmV4cG9ydCBjb25zdCBSR0JfUzNUQ19EWFQxX0Zvcm1hdCA9IDMzNzc2O1xuZXhwb3J0IGNvbnN0IFJHQkFfUzNUQ19EWFQxX0Zvcm1hdCA9IDMzNzc3O1xuZXhwb3J0IGNvbnN0IFJHQkFfUzNUQ19EWFQzX0Zvcm1hdCA9IDMzNzc4O1xuZXhwb3J0IGNvbnN0IFJHQkFfUzNUQ19EWFQ1X0Zvcm1hdCA9IDMzNzc5O1xuZXhwb3J0IGNvbnN0IFJHQl9QVlJUQ180QlBQVjFfRm9ybWF0ID0gMzU4NDA7XG5leHBvcnQgY29uc3QgUkdCX1BWUlRDXzJCUFBWMV9Gb3JtYXQgPSAzNTg0MTtcbmV4cG9ydCBjb25zdCBSR0JBX1BWUlRDXzRCUFBWMV9Gb3JtYXQgPSAzNTg0MjtcbmV4cG9ydCBjb25zdCBSR0JBX1BWUlRDXzJCUFBWMV9Gb3JtYXQgPSAzNTg0MztcbmV4cG9ydCBjb25zdCBSR0JfRVRDMV9Gb3JtYXQgPSAzNjE5NjtcbmV4cG9ydCBjb25zdCBSR0JfRVRDMl9Gb3JtYXQgPSAzNzQ5MjtcbmV4cG9ydCBjb25zdCBSR0JBX0VUQzJfRUFDX0Zvcm1hdCA9IDM3NDk2O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ180eDRfRm9ybWF0ID0gMzc4MDg7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzV4NF9Gb3JtYXQgPSAzNzgwOTtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfNXg1X0Zvcm1hdCA9IDM3ODEwO1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ182eDVfRm9ybWF0ID0gMzc4MTE7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzZ4Nl9Gb3JtYXQgPSAzNzgxMjtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfOHg1X0Zvcm1hdCA9IDM3ODEzO1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ184eDZfRm9ybWF0ID0gMzc4MTQ7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzh4OF9Gb3JtYXQgPSAzNzgxNTtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfMTB4NV9Gb3JtYXQgPSAzNzgxNjtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfMTB4Nl9Gb3JtYXQgPSAzNzgxNztcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfMTB4OF9Gb3JtYXQgPSAzNzgxODtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfMTB4MTBfRm9ybWF0ID0gMzc4MTk7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEyeDEwX0Zvcm1hdCA9IDM3ODIwO1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ18xMngxMl9Gb3JtYXQgPSAzNzgyMTtcbmV4cG9ydCBjb25zdCBSR0JBX0JQVENfRm9ybWF0ID0gMzY0OTI7XG5leHBvcnQgY29uc3QgUkVEX1JHVEMxX0Zvcm1hdCA9IDM2MjgzO1xuZXhwb3J0IGNvbnN0IFNJR05FRF9SRURfUkdUQzFfRm9ybWF0ID0gMzYyODQ7XG5leHBvcnQgY29uc3QgUkVEX0dSRUVOX1JHVEMyX0Zvcm1hdCA9IDM2Mjg1O1xuZXhwb3J0IGNvbnN0IFNJR05FRF9SRURfR1JFRU5fUkdUQzJfRm9ybWF0ID0gMzYyODY7XG5leHBvcnQgY29uc3QgTG9vcE9uY2UgPSAyMjAwO1xuZXhwb3J0IGNvbnN0IExvb3BSZXBlYXQgPSAyMjAxO1xuZXhwb3J0IGNvbnN0IExvb3BQaW5nUG9uZyA9IDIyMDI7XG5leHBvcnQgY29uc3QgSW50ZXJwb2xhdGVEaXNjcmV0ZSA9IDIzMDA7XG5leHBvcnQgY29uc3QgSW50ZXJwb2xhdGVMaW5lYXIgPSAyMzAxO1xuZXhwb3J0IGNvbnN0IEludGVycG9sYXRlU21vb3RoID0gMjMwMjtcbmV4cG9ydCBjb25zdCBaZXJvQ3VydmF0dXJlRW5kaW5nID0gMjQwMDtcbmV4cG9ydCBjb25zdCBaZXJvU2xvcGVFbmRpbmcgPSAyNDAxO1xuZXhwb3J0IGNvbnN0IFdyYXBBcm91bmRFbmRpbmcgPSAyNDAyO1xuZXhwb3J0IGNvbnN0IE5vcm1hbEFuaW1hdGlvbkJsZW5kTW9kZSA9IDI1MDA7XG5leHBvcnQgY29uc3QgQWRkaXRpdmVBbmltYXRpb25CbGVuZE1vZGUgPSAyNTAxO1xuZXhwb3J0IGNvbnN0IFRyaWFuZ2xlc0RyYXdNb2RlID0gMDtcbmV4cG9ydCBjb25zdCBUcmlhbmdsZVN0cmlwRHJhd01vZGUgPSAxO1xuZXhwb3J0IGNvbnN0IFRyaWFuZ2xlRmFuRHJhd01vZGUgPSAyO1xuLyoqIEBkZXByZWNhdGVkIFVzZSBMaW5lYXJTUkdCQ29sb3JTcGFjZSBvciBOb0NvbG9yU3BhY2UgaW4gdGhyZWUuanMgcjE1MisuICovXG5leHBvcnQgY29uc3QgTGluZWFyRW5jb2RpbmcgPSAzMDAwO1xuLyoqIEBkZXByZWNhdGVkIFVzZSBTUkdCQ29sb3JTcGFjZSBpbiB0aHJlZS5qcyByMTUyKy4gKi9cbmV4cG9ydCBjb25zdCBzUkdCRW5jb2RpbmcgPSAzMDAxO1xuZXhwb3J0IGNvbnN0IEJhc2ljRGVwdGhQYWNraW5nID0gMzIwMDtcbmV4cG9ydCBjb25zdCBSR0JBRGVwdGhQYWNraW5nID0gMzIwMTtcbmV4cG9ydCBjb25zdCBUYW5nZW50U3BhY2VOb3JtYWxNYXAgPSAwO1xuZXhwb3J0IGNvbnN0IE9iamVjdFNwYWNlTm9ybWFsTWFwID0gMTtcblxuLy8gQ29sb3Igc3BhY2Ugc3RyaW5nIGlkZW50aWZpZXJzLCBtYXRjaGluZyBDU1MgQ29sb3IgTW9kdWxlIExldmVsIDQgYW5kIFdlYkdQVSBuYW1lcyB3aGVyZSBhdmFpbGFibGUuXG5leHBvcnQgY29uc3QgTm9Db2xvclNwYWNlID0gJyc7XG5leHBvcnQgY29uc3QgU1JHQkNvbG9yU3BhY2UgPSAnc3JnYic7XG5leHBvcnQgY29uc3QgTGluZWFyU1JHQkNvbG9yU3BhY2UgPSAnc3JnYi1saW5lYXInO1xuZXhwb3J0IGNvbnN0IERpc3BsYXlQM0NvbG9yU3BhY2UgPSAnZGlzcGxheS1wMyc7XG5cbmV4cG9ydCBjb25zdCBaZXJvU3RlbmNpbE9wID0gMDtcbmV4cG9ydCBjb25zdCBLZWVwU3RlbmNpbE9wID0gNzY4MDtcbmV4cG9ydCBjb25zdCBSZXBsYWNlU3RlbmNpbE9wID0gNzY4MTtcbmV4cG9ydCBjb25zdCBJbmNyZW1lbnRTdGVuY2lsT3AgPSA3NjgyO1xuZXhwb3J0IGNvbnN0IERlY3JlbWVudFN0ZW5jaWxPcCA9IDc2ODM7XG5leHBvcnQgY29uc3QgSW5jcmVtZW50V3JhcFN0ZW5jaWxPcCA9IDM0MDU1O1xuZXhwb3J0IGNvbnN0IERlY3JlbWVudFdyYXBTdGVuY2lsT3AgPSAzNDA1NjtcbmV4cG9ydCBjb25zdCBJbnZlcnRTdGVuY2lsT3AgPSA1Mzg2O1xuXG5leHBvcnQgY29uc3QgTmV2ZXJTdGVuY2lsRnVuYyA9IDUxMjtcbmV4cG9ydCBjb25zdCBMZXNzU3RlbmNpbEZ1bmMgPSA1MTM7XG5leHBvcnQgY29uc3QgRXF1YWxTdGVuY2lsRnVuYyA9IDUxNDtcbmV4cG9ydCBjb25zdCBMZXNzRXF1YWxTdGVuY2lsRnVuYyA9IDUxNTtcbmV4cG9ydCBjb25zdCBHcmVhdGVyU3RlbmNpbEZ1bmMgPSA1MTY7XG5leHBvcnQgY29uc3QgTm90RXF1YWxTdGVuY2lsRnVuYyA9IDUxNztcbmV4cG9ydCBjb25zdCBHcmVhdGVyRXF1YWxTdGVuY2lsRnVuYyA9IDUxODtcbmV4cG9ydCBjb25zdCBBbHdheXNTdGVuY2lsRnVuYyA9IDUxOTtcblxuZXhwb3J0IGNvbnN0IE5ldmVyQ29tcGFyZSA9IDUxMjtcbmV4cG9ydCBjb25zdCBMZXNzQ29tcGFyZSA9IDUxMztcbmV4cG9ydCBjb25zdCBFcXVhbENvbXBhcmUgPSA1MTQ7XG5leHBvcnQgY29uc3QgTGVzc0VxdWFsQ29tcGFyZSA9IDUxNTtcbmV4cG9ydCBjb25zdCBHcmVhdGVyQ29tcGFyZSA9IDUxNjtcbmV4cG9ydCBjb25zdCBOb3RFcXVhbENvbXBhcmUgPSA1MTc7XG5leHBvcnQgY29uc3QgR3JlYXRlckVxdWFsQ29tcGFyZSA9IDUxODtcbmV4cG9ydCBjb25zdCBBbHdheXNDb21wYXJlID0gNTE5O1xuXG5leHBvcnQgY29uc3QgU3RhdGljRHJhd1VzYWdlID0gMzUwNDQ7XG5leHBvcnQgY29uc3QgRHluYW1pY0RyYXdVc2FnZSA9IDM1MDQ4O1xuZXhwb3J0IGNvbnN0IFN0cmVhbURyYXdVc2FnZSA9IDM1MDQwO1xuZXhwb3J0IGNvbnN0IFN0YXRpY1JlYWRVc2FnZSA9IDM1MDQ1O1xuZXhwb3J0IGNvbnN0IER5bmFtaWNSZWFkVXNhZ2UgPSAzNTA0OTtcbmV4cG9ydCBjb25zdCBTdHJlYW1SZWFkVXNhZ2UgPSAzNTA0MTtcbmV4cG9ydCBjb25zdCBTdGF0aWNDb3B5VXNhZ2UgPSAzNTA0NjtcbmV4cG9ydCBjb25zdCBEeW5hbWljQ29weVVzYWdlID0gMzUwNTA7XG5leHBvcnQgY29uc3QgU3RyZWFtQ29weVVzYWdlID0gMzUwNDI7XG5cbmV4cG9ydCBjb25zdCBHTFNMMSA9ICcxMDAnO1xuZXhwb3J0IGNvbnN0IEdMU0wzID0gJzMwMCBlcyc7XG5cbmV4cG9ydCBjb25zdCBfU1JHQkFGb3JtYXQgPSAxMDM1OyAvLyBmYWxsYmFjayBmb3IgV2ViR0wgMVxuXG5leHBvcnQgY29uc3QgV2ViR0xDb29yZGluYXRlU3lzdGVtID0gMjAwMDtcbmV4cG9ydCBjb25zdCBXZWJHUFVDb29yZGluYXRlU3lzdGVtID0gMjAwMTtcbiIsImltcG9ydCAqIGFzIE1hdGhVdGlscyBmcm9tICcuL01hdGhVdGlscy5qcyc7XG5cbmNsYXNzIFZlY3RvcjIge1xuXG5cdGNvbnN0cnVjdG9yKCB4ID0gMCwgeSA9IDAgKSB7XG5cblx0XHRWZWN0b3IyLnByb3RvdHlwZS5pc1ZlY3RvcjIgPSB0cnVlO1xuXG5cdFx0dGhpcy54ID0geDtcblx0XHR0aGlzLnkgPSB5O1xuXG5cdH1cblxuXHRnZXQgd2lkdGgoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy54O1xuXG5cdH1cblxuXHRzZXQgd2lkdGgoIHZhbHVlICkge1xuXG5cdFx0dGhpcy54ID0gdmFsdWU7XG5cblx0fVxuXG5cdGdldCBoZWlnaHQoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy55O1xuXG5cdH1cblxuXHRzZXQgaGVpZ2h0KCB2YWx1ZSApIHtcblxuXHRcdHRoaXMueSA9IHZhbHVlO1xuXG5cdH1cblxuXHRzZXQoIHgsIHkgKSB7XG5cblx0XHR0aGlzLnggPSB4O1xuXHRcdHRoaXMueSA9IHk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0U2NhbGFyKCBzY2FsYXIgKSB7XG5cblx0XHR0aGlzLnggPSBzY2FsYXI7XG5cdFx0dGhpcy55ID0gc2NhbGFyO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldFgoIHggKSB7XG5cblx0XHR0aGlzLnggPSB4O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldFkoIHkgKSB7XG5cblx0XHR0aGlzLnkgPSB5O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldENvbXBvbmVudCggaW5kZXgsIHZhbHVlICkge1xuXG5cdFx0c3dpdGNoICggaW5kZXggKSB7XG5cblx0XHRcdGNhc2UgMDogdGhpcy54ID0gdmFsdWU7IGJyZWFrO1xuXHRcdFx0Y2FzZSAxOiB0aGlzLnkgPSB2YWx1ZTsgYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoICdpbmRleCBpcyBvdXQgb2YgcmFuZ2U6ICcgKyBpbmRleCApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGdldENvbXBvbmVudCggaW5kZXggKSB7XG5cblx0XHRzd2l0Y2ggKCBpbmRleCApIHtcblxuXHRcdFx0Y2FzZSAwOiByZXR1cm4gdGhpcy54O1xuXHRcdFx0Y2FzZSAxOiByZXR1cm4gdGhpcy55O1xuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCAnaW5kZXggaXMgb3V0IG9mIHJhbmdlOiAnICsgaW5kZXggKTtcblxuXHRcdH1cblxuXHR9XG5cblx0Y2xvbmUoKSB7XG5cblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoIHRoaXMueCwgdGhpcy55ICk7XG5cblx0fVxuXG5cdGNvcHkoIHYgKSB7XG5cblx0XHR0aGlzLnggPSB2Lng7XG5cdFx0dGhpcy55ID0gdi55O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGFkZCggdiApIHtcblxuXHRcdHRoaXMueCArPSB2Lng7XG5cdFx0dGhpcy55ICs9IHYueTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhZGRTY2FsYXIoIHMgKSB7XG5cblx0XHR0aGlzLnggKz0gcztcblx0XHR0aGlzLnkgKz0gcztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhZGRWZWN0b3JzKCBhLCBiICkge1xuXG5cdFx0dGhpcy54ID0gYS54ICsgYi54O1xuXHRcdHRoaXMueSA9IGEueSArIGIueTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhZGRTY2FsZWRWZWN0b3IoIHYsIHMgKSB7XG5cblx0XHR0aGlzLnggKz0gdi54ICogcztcblx0XHR0aGlzLnkgKz0gdi55ICogcztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzdWIoIHYgKSB7XG5cblx0XHR0aGlzLnggLT0gdi54O1xuXHRcdHRoaXMueSAtPSB2Lnk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c3ViU2NhbGFyKCBzICkge1xuXG5cdFx0dGhpcy54IC09IHM7XG5cdFx0dGhpcy55IC09IHM7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c3ViVmVjdG9ycyggYSwgYiApIHtcblxuXHRcdHRoaXMueCA9IGEueCAtIGIueDtcblx0XHR0aGlzLnkgPSBhLnkgLSBiLnk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bXVsdGlwbHkoIHYgKSB7XG5cblx0XHR0aGlzLnggKj0gdi54O1xuXHRcdHRoaXMueSAqPSB2Lnk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bXVsdGlwbHlTY2FsYXIoIHNjYWxhciApIHtcblxuXHRcdHRoaXMueCAqPSBzY2FsYXI7XG5cdFx0dGhpcy55ICo9IHNjYWxhcjtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRkaXZpZGUoIHYgKSB7XG5cblx0XHR0aGlzLnggLz0gdi54O1xuXHRcdHRoaXMueSAvPSB2Lnk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0ZGl2aWRlU2NhbGFyKCBzY2FsYXIgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhciggMSAvIHNjYWxhciApO1xuXG5cdH1cblxuXHRhcHBseU1hdHJpeDMoIG0gKSB7XG5cblx0XHRjb25zdCB4ID0gdGhpcy54LCB5ID0gdGhpcy55O1xuXHRcdGNvbnN0IGUgPSBtLmVsZW1lbnRzO1xuXG5cdFx0dGhpcy54ID0gZVsgMCBdICogeCArIGVbIDMgXSAqIHkgKyBlWyA2IF07XG5cdFx0dGhpcy55ID0gZVsgMSBdICogeCArIGVbIDQgXSAqIHkgKyBlWyA3IF07XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bWluKCB2ICkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5taW4oIHRoaXMueCwgdi54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5taW4oIHRoaXMueSwgdi55ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bWF4KCB2ICkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5tYXgoIHRoaXMueCwgdi54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5tYXgoIHRoaXMueSwgdi55ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y2xhbXAoIG1pbiwgbWF4ICkge1xuXG5cdFx0Ly8gYXNzdW1lcyBtaW4gPCBtYXgsIGNvbXBvbmVudHdpc2VcblxuXHRcdHRoaXMueCA9IE1hdGgubWF4KCBtaW4ueCwgTWF0aC5taW4oIG1heC54LCB0aGlzLnggKSApO1xuXHRcdHRoaXMueSA9IE1hdGgubWF4KCBtaW4ueSwgTWF0aC5taW4oIG1heC55LCB0aGlzLnkgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNsYW1wU2NhbGFyKCBtaW5WYWwsIG1heFZhbCApIHtcblxuXHRcdHRoaXMueCA9IE1hdGgubWF4KCBtaW5WYWwsIE1hdGgubWluKCBtYXhWYWwsIHRoaXMueCApICk7XG5cdFx0dGhpcy55ID0gTWF0aC5tYXgoIG1pblZhbCwgTWF0aC5taW4oIG1heFZhbCwgdGhpcy55ICkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjbGFtcExlbmd0aCggbWluLCBtYXggKSB7XG5cblx0XHRjb25zdCBsZW5ndGggPSB0aGlzLmxlbmd0aCgpO1xuXG5cdFx0cmV0dXJuIHRoaXMuZGl2aWRlU2NhbGFyKCBsZW5ndGggfHwgMSApLm11bHRpcGx5U2NhbGFyKCBNYXRoLm1heCggbWluLCBNYXRoLm1pbiggbWF4LCBsZW5ndGggKSApICk7XG5cblx0fVxuXG5cdGZsb29yKCkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5mbG9vciggdGhpcy54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5mbG9vciggdGhpcy55ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y2VpbCgpIHtcblxuXHRcdHRoaXMueCA9IE1hdGguY2VpbCggdGhpcy54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5jZWlsKCB0aGlzLnkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRyb3VuZCgpIHtcblxuXHRcdHRoaXMueCA9IE1hdGgucm91bmQoIHRoaXMueCApO1xuXHRcdHRoaXMueSA9IE1hdGgucm91bmQoIHRoaXMueSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHJvdW5kVG9aZXJvKCkge1xuXG5cdFx0dGhpcy54ID0gKCB0aGlzLnggPCAwICkgPyBNYXRoLmNlaWwoIHRoaXMueCApIDogTWF0aC5mbG9vciggdGhpcy54ICk7XG5cdFx0dGhpcy55ID0gKCB0aGlzLnkgPCAwICkgPyBNYXRoLmNlaWwoIHRoaXMueSApIDogTWF0aC5mbG9vciggdGhpcy55ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bmVnYXRlKCkge1xuXG5cdFx0dGhpcy54ID0gLSB0aGlzLng7XG5cdFx0dGhpcy55ID0gLSB0aGlzLnk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0ZG90KCB2ICkge1xuXG5cdFx0cmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueTtcblxuXHR9XG5cblx0Y3Jvc3MoIHYgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54O1xuXG5cdH1cblxuXHRsZW5ndGhTcSgpIHtcblxuXHRcdHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnk7XG5cblx0fVxuXG5cdGxlbmd0aCgpIHtcblxuXHRcdHJldHVybiBNYXRoLnNxcnQoIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSApO1xuXG5cdH1cblxuXHRtYW5oYXR0YW5MZW5ndGgoKSB7XG5cblx0XHRyZXR1cm4gTWF0aC5hYnMoIHRoaXMueCApICsgTWF0aC5hYnMoIHRoaXMueSApO1xuXG5cdH1cblxuXHRub3JtYWxpemUoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIoIHRoaXMubGVuZ3RoKCkgfHwgMSApO1xuXG5cdH1cblxuXHRhbmdsZSgpIHtcblxuXHRcdC8vIGNvbXB1dGVzIHRoZSBhbmdsZSBpbiByYWRpYW5zIHdpdGggcmVzcGVjdCB0byB0aGUgcG9zaXRpdmUgeC1heGlzXG5cblx0XHRjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIoIC0gdGhpcy55LCAtIHRoaXMueCApICsgTWF0aC5QSTtcblxuXHRcdHJldHVybiBhbmdsZTtcblxuXHR9XG5cblx0YW5nbGVUbyggdiApIHtcblxuXHRcdGNvbnN0IGRlbm9taW5hdG9yID0gTWF0aC5zcXJ0KCB0aGlzLmxlbmd0aFNxKCkgKiB2Lmxlbmd0aFNxKCkgKTtcblxuXHRcdGlmICggZGVub21pbmF0b3IgPT09IDAgKSByZXR1cm4gTWF0aC5QSSAvIDI7XG5cblx0XHRjb25zdCB0aGV0YSA9IHRoaXMuZG90KCB2ICkgLyBkZW5vbWluYXRvcjtcblxuXHRcdC8vIGNsYW1wLCB0byBoYW5kbGUgbnVtZXJpY2FsIHByb2JsZW1zXG5cblx0XHRyZXR1cm4gTWF0aC5hY29zKCBNYXRoVXRpbHMuY2xhbXAoIHRoZXRhLCAtIDEsIDEgKSApO1xuXG5cdH1cblxuXHRkaXN0YW5jZVRvKCB2ICkge1xuXG5cdFx0cmV0dXJuIE1hdGguc3FydCggdGhpcy5kaXN0YW5jZVRvU3F1YXJlZCggdiApICk7XG5cblx0fVxuXG5cdGRpc3RhbmNlVG9TcXVhcmVkKCB2ICkge1xuXG5cdFx0Y29uc3QgZHggPSB0aGlzLnggLSB2LngsIGR5ID0gdGhpcy55IC0gdi55O1xuXHRcdHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeTtcblxuXHR9XG5cblx0bWFuaGF0dGFuRGlzdGFuY2VUbyggdiApIHtcblxuXHRcdHJldHVybiBNYXRoLmFicyggdGhpcy54IC0gdi54ICkgKyBNYXRoLmFicyggdGhpcy55IC0gdi55ICk7XG5cblx0fVxuXG5cdHNldExlbmd0aCggbGVuZ3RoICkge1xuXG5cdFx0cmV0dXJuIHRoaXMubm9ybWFsaXplKCkubXVsdGlwbHlTY2FsYXIoIGxlbmd0aCApO1xuXG5cdH1cblxuXHRsZXJwKCB2LCBhbHBoYSApIHtcblxuXHRcdHRoaXMueCArPSAoIHYueCAtIHRoaXMueCApICogYWxwaGE7XG5cdFx0dGhpcy55ICs9ICggdi55IC0gdGhpcy55ICkgKiBhbHBoYTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRsZXJwVmVjdG9ycyggdjEsIHYyLCBhbHBoYSApIHtcblxuXHRcdHRoaXMueCA9IHYxLnggKyAoIHYyLnggLSB2MS54ICkgKiBhbHBoYTtcblx0XHR0aGlzLnkgPSB2MS55ICsgKCB2Mi55IC0gdjEueSApICogYWxwaGE7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0ZXF1YWxzKCB2ICkge1xuXG5cdFx0cmV0dXJuICggKCB2LnggPT09IHRoaXMueCApICYmICggdi55ID09PSB0aGlzLnkgKSApO1xuXG5cdH1cblxuXHRmcm9tQXJyYXkoIGFycmF5LCBvZmZzZXQgPSAwICkge1xuXG5cdFx0dGhpcy54ID0gYXJyYXlbIG9mZnNldCBdO1xuXHRcdHRoaXMueSA9IGFycmF5WyBvZmZzZXQgKyAxIF07XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0dG9BcnJheSggYXJyYXkgPSBbXSwgb2Zmc2V0ID0gMCApIHtcblxuXHRcdGFycmF5WyBvZmZzZXQgXSA9IHRoaXMueDtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMSBdID0gdGhpcy55O1xuXG5cdFx0cmV0dXJuIGFycmF5O1xuXG5cdH1cblxuXHRmcm9tQnVmZmVyQXR0cmlidXRlKCBhdHRyaWJ1dGUsIGluZGV4ICkge1xuXG5cdFx0dGhpcy54ID0gYXR0cmlidXRlLmdldFgoIGluZGV4ICk7XG5cdFx0dGhpcy55ID0gYXR0cmlidXRlLmdldFkoIGluZGV4ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0cm90YXRlQXJvdW5kKCBjZW50ZXIsIGFuZ2xlICkge1xuXG5cdFx0Y29uc3QgYyA9IE1hdGguY29zKCBhbmdsZSApLCBzID0gTWF0aC5zaW4oIGFuZ2xlICk7XG5cblx0XHRjb25zdCB4ID0gdGhpcy54IC0gY2VudGVyLng7XG5cdFx0Y29uc3QgeSA9IHRoaXMueSAtIGNlbnRlci55O1xuXG5cdFx0dGhpcy54ID0geCAqIGMgLSB5ICogcyArIGNlbnRlci54O1xuXHRcdHRoaXMueSA9IHggKiBzICsgeSAqIGMgKyBjZW50ZXIueTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRyYW5kb20oKSB7XG5cblx0XHR0aGlzLnggPSBNYXRoLnJhbmRvbSgpO1xuXHRcdHRoaXMueSA9IE1hdGgucmFuZG9tKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0KlsgU3ltYm9sLml0ZXJhdG9yIF0oKSB7XG5cblx0XHR5aWVsZCB0aGlzLng7XG5cdFx0eWllbGQgdGhpcy55O1xuXG5cdH1cblxufVxuXG5leHBvcnQgeyBWZWN0b3IyIH07XG4iLCJpbXBvcnQgKiBhcyBNYXRoVXRpbHMgZnJvbSAnLi9NYXRoVXRpbHMuanMnO1xuaW1wb3J0IHsgUXVhdGVybmlvbiB9IGZyb20gJy4vUXVhdGVybmlvbi5qcyc7XG5cbmNsYXNzIFZlY3RvcjMge1xuXG5cdGNvbnN0cnVjdG9yKCB4ID0gMCwgeSA9IDAsIHogPSAwICkge1xuXG5cdFx0VmVjdG9yMy5wcm90b3R5cGUuaXNWZWN0b3IzID0gdHJ1ZTtcblxuXHRcdHRoaXMueCA9IHg7XG5cdFx0dGhpcy55ID0geTtcblx0XHR0aGlzLnogPSB6O1xuXG5cdH1cblxuXHRzZXQoIHgsIHksIHogKSB7XG5cblx0XHRpZiAoIHogPT09IHVuZGVmaW5lZCApIHogPSB0aGlzLno7IC8vIHNwcml0ZS5zY2FsZS5zZXQoeCx5KVxuXG5cdFx0dGhpcy54ID0geDtcblx0XHR0aGlzLnkgPSB5O1xuXHRcdHRoaXMueiA9IHo7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0U2NhbGFyKCBzY2FsYXIgKSB7XG5cblx0XHR0aGlzLnggPSBzY2FsYXI7XG5cdFx0dGhpcy55ID0gc2NhbGFyO1xuXHRcdHRoaXMueiA9IHNjYWxhcjtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRYKCB4ICkge1xuXG5cdFx0dGhpcy54ID0geDtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRZKCB5ICkge1xuXG5cdFx0dGhpcy55ID0geTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRaKCB6ICkge1xuXG5cdFx0dGhpcy56ID0gejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRDb21wb25lbnQoIGluZGV4LCB2YWx1ZSApIHtcblxuXHRcdHN3aXRjaCAoIGluZGV4ICkge1xuXG5cdFx0XHRjYXNlIDA6IHRoaXMueCA9IHZhbHVlOyBicmVhaztcblx0XHRcdGNhc2UgMTogdGhpcy55ID0gdmFsdWU7IGJyZWFrO1xuXHRcdFx0Y2FzZSAyOiB0aGlzLnogPSB2YWx1ZTsgYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoICdpbmRleCBpcyBvdXQgb2YgcmFuZ2U6ICcgKyBpbmRleCApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGdldENvbXBvbmVudCggaW5kZXggKSB7XG5cblx0XHRzd2l0Y2ggKCBpbmRleCApIHtcblxuXHRcdFx0Y2FzZSAwOiByZXR1cm4gdGhpcy54O1xuXHRcdFx0Y2FzZSAxOiByZXR1cm4gdGhpcy55O1xuXHRcdFx0Y2FzZSAyOiByZXR1cm4gdGhpcy56O1xuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCAnaW5kZXggaXMgb3V0IG9mIHJhbmdlOiAnICsgaW5kZXggKTtcblxuXHRcdH1cblxuXHR9XG5cblx0Y2xvbmUoKSB7XG5cblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoIHRoaXMueCwgdGhpcy55LCB0aGlzLnogKTtcblxuXHR9XG5cblx0Y29weSggdiApIHtcblxuXHRcdHRoaXMueCA9IHYueDtcblx0XHR0aGlzLnkgPSB2Lnk7XG5cdFx0dGhpcy56ID0gdi56O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGFkZCggdiApIHtcblxuXHRcdHRoaXMueCArPSB2Lng7XG5cdFx0dGhpcy55ICs9IHYueTtcblx0XHR0aGlzLnogKz0gdi56O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGFkZFNjYWxhciggcyApIHtcblxuXHRcdHRoaXMueCArPSBzO1xuXHRcdHRoaXMueSArPSBzO1xuXHRcdHRoaXMueiArPSBzO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGFkZFZlY3RvcnMoIGEsIGIgKSB7XG5cblx0XHR0aGlzLnggPSBhLnggKyBiLng7XG5cdFx0dGhpcy55ID0gYS55ICsgYi55O1xuXHRcdHRoaXMueiA9IGEueiArIGIuejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhZGRTY2FsZWRWZWN0b3IoIHYsIHMgKSB7XG5cblx0XHR0aGlzLnggKz0gdi54ICogcztcblx0XHR0aGlzLnkgKz0gdi55ICogcztcblx0XHR0aGlzLnogKz0gdi56ICogcztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzdWIoIHYgKSB7XG5cblx0XHR0aGlzLnggLT0gdi54O1xuXHRcdHRoaXMueSAtPSB2Lnk7XG5cdFx0dGhpcy56IC09IHYuejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzdWJTY2FsYXIoIHMgKSB7XG5cblx0XHR0aGlzLnggLT0gcztcblx0XHR0aGlzLnkgLT0gcztcblx0XHR0aGlzLnogLT0gcztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzdWJWZWN0b3JzKCBhLCBiICkge1xuXG5cdFx0dGhpcy54ID0gYS54IC0gYi54O1xuXHRcdHRoaXMueSA9IGEueSAtIGIueTtcblx0XHR0aGlzLnogPSBhLnogLSBiLno7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bXVsdGlwbHkoIHYgKSB7XG5cblx0XHR0aGlzLnggKj0gdi54O1xuXHRcdHRoaXMueSAqPSB2Lnk7XG5cdFx0dGhpcy56ICo9IHYuejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRtdWx0aXBseVNjYWxhciggc2NhbGFyICkge1xuXG5cdFx0dGhpcy54ICo9IHNjYWxhcjtcblx0XHR0aGlzLnkgKj0gc2NhbGFyO1xuXHRcdHRoaXMueiAqPSBzY2FsYXI7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bXVsdGlwbHlWZWN0b3JzKCBhLCBiICkge1xuXG5cdFx0dGhpcy54ID0gYS54ICogYi54O1xuXHRcdHRoaXMueSA9IGEueSAqIGIueTtcblx0XHR0aGlzLnogPSBhLnogKiBiLno7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0YXBwbHlFdWxlciggZXVsZXIgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBseVF1YXRlcm5pb24oIF9xdWF0ZXJuaW9uLnNldEZyb21FdWxlciggZXVsZXIgKSApO1xuXG5cdH1cblxuXHRhcHBseUF4aXNBbmdsZSggYXhpcywgYW5nbGUgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBseVF1YXRlcm5pb24oIF9xdWF0ZXJuaW9uLnNldEZyb21BeGlzQW5nbGUoIGF4aXMsIGFuZ2xlICkgKTtcblxuXHR9XG5cblx0YXBwbHlNYXRyaXgzKCBtICkge1xuXG5cdFx0Y29uc3QgeCA9IHRoaXMueCwgeSA9IHRoaXMueSwgeiA9IHRoaXMuejtcblx0XHRjb25zdCBlID0gbS5lbGVtZW50cztcblxuXHRcdHRoaXMueCA9IGVbIDAgXSAqIHggKyBlWyAzIF0gKiB5ICsgZVsgNiBdICogejtcblx0XHR0aGlzLnkgPSBlWyAxIF0gKiB4ICsgZVsgNCBdICogeSArIGVbIDcgXSAqIHo7XG5cdFx0dGhpcy56ID0gZVsgMiBdICogeCArIGVbIDUgXSAqIHkgKyBlWyA4IF0gKiB6O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGFwcGx5Tm9ybWFsTWF0cml4KCBtICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwbHlNYXRyaXgzKCBtICkubm9ybWFsaXplKCk7XG5cblx0fVxuXG5cdGFwcGx5TWF0cml4NCggbSApIHtcblxuXHRcdGNvbnN0IHggPSB0aGlzLngsIHkgPSB0aGlzLnksIHogPSB0aGlzLno7XG5cdFx0Y29uc3QgZSA9IG0uZWxlbWVudHM7XG5cblx0XHRjb25zdCB3ID0gMSAvICggZVsgMyBdICogeCArIGVbIDcgXSAqIHkgKyBlWyAxMSBdICogeiArIGVbIDE1IF0gKTtcblxuXHRcdHRoaXMueCA9ICggZVsgMCBdICogeCArIGVbIDQgXSAqIHkgKyBlWyA4IF0gKiB6ICsgZVsgMTIgXSApICogdztcblx0XHR0aGlzLnkgPSAoIGVbIDEgXSAqIHggKyBlWyA1IF0gKiB5ICsgZVsgOSBdICogeiArIGVbIDEzIF0gKSAqIHc7XG5cdFx0dGhpcy56ID0gKCBlWyAyIF0gKiB4ICsgZVsgNiBdICogeSArIGVbIDEwIF0gKiB6ICsgZVsgMTQgXSApICogdztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRhcHBseVF1YXRlcm5pb24oIHEgKSB7XG5cblx0XHRjb25zdCB4ID0gdGhpcy54LCB5ID0gdGhpcy55LCB6ID0gdGhpcy56O1xuXHRcdGNvbnN0IHF4ID0gcS54LCBxeSA9IHEueSwgcXogPSBxLnosIHF3ID0gcS53O1xuXG5cdFx0Ly8gY2FsY3VsYXRlIHF1YXQgKiB2ZWN0b3JcblxuXHRcdGNvbnN0IGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5O1xuXHRcdGNvbnN0IGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6O1xuXHRcdGNvbnN0IGl6ID0gcXcgKiB6ICsgcXggKiB5IC0gcXkgKiB4O1xuXHRcdGNvbnN0IGl3ID0gLSBxeCAqIHggLSBxeSAqIHkgLSBxeiAqIHo7XG5cblx0XHQvLyBjYWxjdWxhdGUgcmVzdWx0ICogaW52ZXJzZSBxdWF0XG5cblx0XHR0aGlzLnggPSBpeCAqIHF3ICsgaXcgKiAtIHF4ICsgaXkgKiAtIHF6IC0gaXogKiAtIHF5O1xuXHRcdHRoaXMueSA9IGl5ICogcXcgKyBpdyAqIC0gcXkgKyBpeiAqIC0gcXggLSBpeCAqIC0gcXo7XG5cdFx0dGhpcy56ID0gaXogKiBxdyArIGl3ICogLSBxeiArIGl4ICogLSBxeSAtIGl5ICogLSBxeDtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRwcm9qZWN0KCBjYW1lcmEgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBseU1hdHJpeDQoIGNhbWVyYS5tYXRyaXhXb3JsZEludmVyc2UgKS5hcHBseU1hdHJpeDQoIGNhbWVyYS5wcm9qZWN0aW9uTWF0cml4ICk7XG5cblx0fVxuXG5cdHVucHJvamVjdCggY2FtZXJhICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwbHlNYXRyaXg0KCBjYW1lcmEucHJvamVjdGlvbk1hdHJpeEludmVyc2UgKS5hcHBseU1hdHJpeDQoIGNhbWVyYS5tYXRyaXhXb3JsZCApO1xuXG5cdH1cblxuXHR0cmFuc2Zvcm1EaXJlY3Rpb24oIG0gKSB7XG5cblx0XHQvLyBpbnB1dDogVEhSRUUuTWF0cml4NCBhZmZpbmUgbWF0cml4XG5cdFx0Ly8gdmVjdG9yIGludGVycHJldGVkIGFzIGEgZGlyZWN0aW9uXG5cblx0XHRjb25zdCB4ID0gdGhpcy54LCB5ID0gdGhpcy55LCB6ID0gdGhpcy56O1xuXHRcdGNvbnN0IGUgPSBtLmVsZW1lbnRzO1xuXG5cdFx0dGhpcy54ID0gZVsgMCBdICogeCArIGVbIDQgXSAqIHkgKyBlWyA4IF0gKiB6O1xuXHRcdHRoaXMueSA9IGVbIDEgXSAqIHggKyBlWyA1IF0gKiB5ICsgZVsgOSBdICogejtcblx0XHR0aGlzLnogPSBlWyAyIF0gKiB4ICsgZVsgNiBdICogeSArIGVbIDEwIF0gKiB6O1xuXG5cdFx0cmV0dXJuIHRoaXMubm9ybWFsaXplKCk7XG5cblx0fVxuXG5cdGRpdmlkZSggdiApIHtcblxuXHRcdHRoaXMueCAvPSB2Lng7XG5cdFx0dGhpcy55IC89IHYueTtcblx0XHR0aGlzLnogLz0gdi56O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGRpdmlkZVNjYWxhciggc2NhbGFyICkge1xuXG5cdFx0cmV0dXJuIHRoaXMubXVsdGlwbHlTY2FsYXIoIDEgLyBzY2FsYXIgKTtcblxuXHR9XG5cblx0bWluKCB2ICkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5taW4oIHRoaXMueCwgdi54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5taW4oIHRoaXMueSwgdi55ICk7XG5cdFx0dGhpcy56ID0gTWF0aC5taW4oIHRoaXMueiwgdi56ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0bWF4KCB2ICkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5tYXgoIHRoaXMueCwgdi54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5tYXgoIHRoaXMueSwgdi55ICk7XG5cdFx0dGhpcy56ID0gTWF0aC5tYXgoIHRoaXMueiwgdi56ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0Y2xhbXAoIG1pbiwgbWF4ICkge1xuXG5cdFx0Ly8gYXNzdW1lcyBtaW4gPCBtYXgsIGNvbXBvbmVudHdpc2VcblxuXHRcdHRoaXMueCA9IE1hdGgubWF4KCBtaW4ueCwgTWF0aC5taW4oIG1heC54LCB0aGlzLnggKSApO1xuXHRcdHRoaXMueSA9IE1hdGgubWF4KCBtaW4ueSwgTWF0aC5taW4oIG1heC55LCB0aGlzLnkgKSApO1xuXHRcdHRoaXMueiA9IE1hdGgubWF4KCBtaW4ueiwgTWF0aC5taW4oIG1heC56LCB0aGlzLnogKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNsYW1wU2NhbGFyKCBtaW5WYWwsIG1heFZhbCApIHtcblxuXHRcdHRoaXMueCA9IE1hdGgubWF4KCBtaW5WYWwsIE1hdGgubWluKCBtYXhWYWwsIHRoaXMueCApICk7XG5cdFx0dGhpcy55ID0gTWF0aC5tYXgoIG1pblZhbCwgTWF0aC5taW4oIG1heFZhbCwgdGhpcy55ICkgKTtcblx0XHR0aGlzLnogPSBNYXRoLm1heCggbWluVmFsLCBNYXRoLm1pbiggbWF4VmFsLCB0aGlzLnogKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNsYW1wTGVuZ3RoKCBtaW4sIG1heCApIHtcblxuXHRcdGNvbnN0IGxlbmd0aCA9IHRoaXMubGVuZ3RoKCk7XG5cblx0XHRyZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIoIGxlbmd0aCB8fCAxICkubXVsdGlwbHlTY2FsYXIoIE1hdGgubWF4KCBtaW4sIE1hdGgubWluKCBtYXgsIGxlbmd0aCApICkgKTtcblxuXHR9XG5cblx0Zmxvb3IoKSB7XG5cblx0XHR0aGlzLnggPSBNYXRoLmZsb29yKCB0aGlzLnggKTtcblx0XHR0aGlzLnkgPSBNYXRoLmZsb29yKCB0aGlzLnkgKTtcblx0XHR0aGlzLnogPSBNYXRoLmZsb29yKCB0aGlzLnogKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRjZWlsKCkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5jZWlsKCB0aGlzLnggKTtcblx0XHR0aGlzLnkgPSBNYXRoLmNlaWwoIHRoaXMueSApO1xuXHRcdHRoaXMueiA9IE1hdGguY2VpbCggdGhpcy56ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0cm91bmQoKSB7XG5cblx0XHR0aGlzLnggPSBNYXRoLnJvdW5kKCB0aGlzLnggKTtcblx0XHR0aGlzLnkgPSBNYXRoLnJvdW5kKCB0aGlzLnkgKTtcblx0XHR0aGlzLnogPSBNYXRoLnJvdW5kKCB0aGlzLnogKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRyb3VuZFRvWmVybygpIHtcblxuXHRcdHRoaXMueCA9ICggdGhpcy54IDwgMCApID8gTWF0aC5jZWlsKCB0aGlzLnggKSA6IE1hdGguZmxvb3IoIHRoaXMueCApO1xuXHRcdHRoaXMueSA9ICggdGhpcy55IDwgMCApID8gTWF0aC5jZWlsKCB0aGlzLnkgKSA6IE1hdGguZmxvb3IoIHRoaXMueSApO1xuXHRcdHRoaXMueiA9ICggdGhpcy56IDwgMCApID8gTWF0aC5jZWlsKCB0aGlzLnogKSA6IE1hdGguZmxvb3IoIHRoaXMueiApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdG5lZ2F0ZSgpIHtcblxuXHRcdHRoaXMueCA9IC0gdGhpcy54O1xuXHRcdHRoaXMueSA9IC0gdGhpcy55O1xuXHRcdHRoaXMueiA9IC0gdGhpcy56O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGRvdCggdiApIHtcblxuXHRcdHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKyB0aGlzLnogKiB2Lno7XG5cblx0fVxuXG5cdC8vIFRPRE8gbGVuZ3RoU3F1YXJlZD9cblxuXHRsZW5ndGhTcSgpIHtcblxuXHRcdHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLno7XG5cblx0fVxuXG5cdGxlbmd0aCgpIHtcblxuXHRcdHJldHVybiBNYXRoLnNxcnQoIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSArIHRoaXMueiAqIHRoaXMueiApO1xuXG5cdH1cblxuXHRtYW5oYXR0YW5MZW5ndGgoKSB7XG5cblx0XHRyZXR1cm4gTWF0aC5hYnMoIHRoaXMueCApICsgTWF0aC5hYnMoIHRoaXMueSApICsgTWF0aC5hYnMoIHRoaXMueiApO1xuXG5cdH1cblxuXHRub3JtYWxpemUoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIoIHRoaXMubGVuZ3RoKCkgfHwgMSApO1xuXG5cdH1cblxuXHRzZXRMZW5ndGgoIGxlbmd0aCApIHtcblxuXHRcdHJldHVybiB0aGlzLm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKCBsZW5ndGggKTtcblxuXHR9XG5cblx0bGVycCggdiwgYWxwaGEgKSB7XG5cblx0XHR0aGlzLnggKz0gKCB2LnggLSB0aGlzLnggKSAqIGFscGhhO1xuXHRcdHRoaXMueSArPSAoIHYueSAtIHRoaXMueSApICogYWxwaGE7XG5cdFx0dGhpcy56ICs9ICggdi56IC0gdGhpcy56ICkgKiBhbHBoYTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRsZXJwVmVjdG9ycyggdjEsIHYyLCBhbHBoYSApIHtcblxuXHRcdHRoaXMueCA9IHYxLnggKyAoIHYyLnggLSB2MS54ICkgKiBhbHBoYTtcblx0XHR0aGlzLnkgPSB2MS55ICsgKCB2Mi55IC0gdjEueSApICogYWxwaGE7XG5cdFx0dGhpcy56ID0gdjEueiArICggdjIueiAtIHYxLnogKSAqIGFscGhhO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNyb3NzKCB2ICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuY3Jvc3NWZWN0b3JzKCB0aGlzLCB2ICk7XG5cblx0fVxuXG5cdGNyb3NzVmVjdG9ycyggYSwgYiApIHtcblxuXHRcdGNvbnN0IGF4ID0gYS54LCBheSA9IGEueSwgYXogPSBhLno7XG5cdFx0Y29uc3QgYnggPSBiLngsIGJ5ID0gYi55LCBieiA9IGIuejtcblxuXHRcdHRoaXMueCA9IGF5ICogYnogLSBheiAqIGJ5O1xuXHRcdHRoaXMueSA9IGF6ICogYnggLSBheCAqIGJ6O1xuXHRcdHRoaXMueiA9IGF4ICogYnkgLSBheSAqIGJ4O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHByb2plY3RPblZlY3RvciggdiApIHtcblxuXHRcdGNvbnN0IGRlbm9taW5hdG9yID0gdi5sZW5ndGhTcSgpO1xuXG5cdFx0aWYgKCBkZW5vbWluYXRvciA9PT0gMCApIHJldHVybiB0aGlzLnNldCggMCwgMCwgMCApO1xuXG5cdFx0Y29uc3Qgc2NhbGFyID0gdi5kb3QoIHRoaXMgKSAvIGRlbm9taW5hdG9yO1xuXG5cdFx0cmV0dXJuIHRoaXMuY29weSggdiApLm11bHRpcGx5U2NhbGFyKCBzY2FsYXIgKTtcblxuXHR9XG5cblx0cHJvamVjdE9uUGxhbmUoIHBsYW5lTm9ybWFsICkge1xuXG5cdFx0X3ZlY3Rvci5jb3B5KCB0aGlzICkucHJvamVjdE9uVmVjdG9yKCBwbGFuZU5vcm1hbCApO1xuXG5cdFx0cmV0dXJuIHRoaXMuc3ViKCBfdmVjdG9yICk7XG5cblx0fVxuXG5cdHJlZmxlY3QoIG5vcm1hbCApIHtcblxuXHRcdC8vIHJlZmxlY3QgaW5jaWRlbnQgdmVjdG9yIG9mZiBwbGFuZSBvcnRob2dvbmFsIHRvIG5vcm1hbFxuXHRcdC8vIG5vcm1hbCBpcyBhc3N1bWVkIHRvIGhhdmUgdW5pdCBsZW5ndGhcblxuXHRcdHJldHVybiB0aGlzLnN1YiggX3ZlY3Rvci5jb3B5KCBub3JtYWwgKS5tdWx0aXBseVNjYWxhciggMiAqIHRoaXMuZG90KCBub3JtYWwgKSApICk7XG5cblx0fVxuXG5cdGFuZ2xlVG8oIHYgKSB7XG5cblx0XHRjb25zdCBkZW5vbWluYXRvciA9IE1hdGguc3FydCggdGhpcy5sZW5ndGhTcSgpICogdi5sZW5ndGhTcSgpICk7XG5cblx0XHRpZiAoIGRlbm9taW5hdG9yID09PSAwICkgcmV0dXJuIE1hdGguUEkgLyAyO1xuXG5cdFx0Y29uc3QgdGhldGEgPSB0aGlzLmRvdCggdiApIC8gZGVub21pbmF0b3I7XG5cblx0XHQvLyBjbGFtcCwgdG8gaGFuZGxlIG51bWVyaWNhbCBwcm9ibGVtc1xuXG5cdFx0cmV0dXJuIE1hdGguYWNvcyggTWF0aFV0aWxzLmNsYW1wKCB0aGV0YSwgLSAxLCAxICkgKTtcblxuXHR9XG5cblx0ZGlzdGFuY2VUbyggdiApIHtcblxuXHRcdHJldHVybiBNYXRoLnNxcnQoIHRoaXMuZGlzdGFuY2VUb1NxdWFyZWQoIHYgKSApO1xuXG5cdH1cblxuXHRkaXN0YW5jZVRvU3F1YXJlZCggdiApIHtcblxuXHRcdGNvbnN0IGR4ID0gdGhpcy54IC0gdi54LCBkeSA9IHRoaXMueSAtIHYueSwgZHogPSB0aGlzLnogLSB2Lno7XG5cblx0XHRyZXR1cm4gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuXG5cdH1cblxuXHRtYW5oYXR0YW5EaXN0YW5jZVRvKCB2ICkge1xuXG5cdFx0cmV0dXJuIE1hdGguYWJzKCB0aGlzLnggLSB2LnggKSArIE1hdGguYWJzKCB0aGlzLnkgLSB2LnkgKSArIE1hdGguYWJzKCB0aGlzLnogLSB2LnogKTtcblxuXHR9XG5cblx0c2V0RnJvbVNwaGVyaWNhbCggcyApIHtcblxuXHRcdHJldHVybiB0aGlzLnNldEZyb21TcGhlcmljYWxDb29yZHMoIHMucmFkaXVzLCBzLnBoaSwgcy50aGV0YSApO1xuXG5cdH1cblxuXHRzZXRGcm9tU3BoZXJpY2FsQ29vcmRzKCByYWRpdXMsIHBoaSwgdGhldGEgKSB7XG5cblx0XHRjb25zdCBzaW5QaGlSYWRpdXMgPSBNYXRoLnNpbiggcGhpICkgKiByYWRpdXM7XG5cblx0XHR0aGlzLnggPSBzaW5QaGlSYWRpdXMgKiBNYXRoLnNpbiggdGhldGEgKTtcblx0XHR0aGlzLnkgPSBNYXRoLmNvcyggcGhpICkgKiByYWRpdXM7XG5cdFx0dGhpcy56ID0gc2luUGhpUmFkaXVzICogTWF0aC5jb3MoIHRoZXRhICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0RnJvbUN5bGluZHJpY2FsKCBjICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuc2V0RnJvbUN5bGluZHJpY2FsQ29vcmRzKCBjLnJhZGl1cywgYy50aGV0YSwgYy55ICk7XG5cblx0fVxuXG5cdHNldEZyb21DeWxpbmRyaWNhbENvb3JkcyggcmFkaXVzLCB0aGV0YSwgeSApIHtcblxuXHRcdHRoaXMueCA9IHJhZGl1cyAqIE1hdGguc2luKCB0aGV0YSApO1xuXHRcdHRoaXMueSA9IHk7XG5cdFx0dGhpcy56ID0gcmFkaXVzICogTWF0aC5jb3MoIHRoZXRhICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0RnJvbU1hdHJpeFBvc2l0aW9uKCBtICkge1xuXG5cdFx0Y29uc3QgZSA9IG0uZWxlbWVudHM7XG5cblx0XHR0aGlzLnggPSBlWyAxMiBdO1xuXHRcdHRoaXMueSA9IGVbIDEzIF07XG5cdFx0dGhpcy56ID0gZVsgMTQgXTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRGcm9tTWF0cml4U2NhbGUoIG0gKSB7XG5cblx0XHRjb25zdCBzeCA9IHRoaXMuc2V0RnJvbU1hdHJpeENvbHVtbiggbSwgMCApLmxlbmd0aCgpO1xuXHRcdGNvbnN0IHN5ID0gdGhpcy5zZXRGcm9tTWF0cml4Q29sdW1uKCBtLCAxICkubGVuZ3RoKCk7XG5cdFx0Y29uc3Qgc3ogPSB0aGlzLnNldEZyb21NYXRyaXhDb2x1bW4oIG0sIDIgKS5sZW5ndGgoKTtcblxuXHRcdHRoaXMueCA9IHN4O1xuXHRcdHRoaXMueSA9IHN5O1xuXHRcdHRoaXMueiA9IHN6O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHNldEZyb21NYXRyaXhDb2x1bW4oIG0sIGluZGV4ICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuZnJvbUFycmF5KCBtLmVsZW1lbnRzLCBpbmRleCAqIDQgKTtcblxuXHR9XG5cblx0c2V0RnJvbU1hdHJpeDNDb2x1bW4oIG0sIGluZGV4ICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuZnJvbUFycmF5KCBtLmVsZW1lbnRzLCBpbmRleCAqIDMgKTtcblxuXHR9XG5cblx0c2V0RnJvbUV1bGVyKCBlICkge1xuXG5cdFx0dGhpcy54ID0gZS5feDtcblx0XHR0aGlzLnkgPSBlLl95O1xuXHRcdHRoaXMueiA9IGUuX3o7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0RnJvbUNvbG9yKCBjICkge1xuXG5cdFx0dGhpcy54ID0gYy5yO1xuXHRcdHRoaXMueSA9IGMuZztcblx0XHR0aGlzLnogPSBjLmI7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0ZXF1YWxzKCB2ICkge1xuXG5cdFx0cmV0dXJuICggKCB2LnggPT09IHRoaXMueCApICYmICggdi55ID09PSB0aGlzLnkgKSAmJiAoIHYueiA9PT0gdGhpcy56ICkgKTtcblxuXHR9XG5cblx0ZnJvbUFycmF5KCBhcnJheSwgb2Zmc2V0ID0gMCApIHtcblxuXHRcdHRoaXMueCA9IGFycmF5WyBvZmZzZXQgXTtcblx0XHR0aGlzLnkgPSBhcnJheVsgb2Zmc2V0ICsgMSBdO1xuXHRcdHRoaXMueiA9IGFycmF5WyBvZmZzZXQgKyAyIF07XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0dG9BcnJheSggYXJyYXkgPSBbXSwgb2Zmc2V0ID0gMCApIHtcblxuXHRcdGFycmF5WyBvZmZzZXQgXSA9IHRoaXMueDtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMSBdID0gdGhpcy55O1xuXHRcdGFycmF5WyBvZmZzZXQgKyAyIF0gPSB0aGlzLno7XG5cblx0XHRyZXR1cm4gYXJyYXk7XG5cblx0fVxuXG5cdGZyb21CdWZmZXJBdHRyaWJ1dGUoIGF0dHJpYnV0ZSwgaW5kZXggKSB7XG5cblx0XHR0aGlzLnggPSBhdHRyaWJ1dGUuZ2V0WCggaW5kZXggKTtcblx0XHR0aGlzLnkgPSBhdHRyaWJ1dGUuZ2V0WSggaW5kZXggKTtcblx0XHR0aGlzLnogPSBhdHRyaWJ1dGUuZ2V0WiggaW5kZXggKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRyYW5kb20oKSB7XG5cblx0XHR0aGlzLnggPSBNYXRoLnJhbmRvbSgpO1xuXHRcdHRoaXMueSA9IE1hdGgucmFuZG9tKCk7XG5cdFx0dGhpcy56ID0gTWF0aC5yYW5kb20oKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRyYW5kb21EaXJlY3Rpb24oKSB7XG5cblx0XHQvLyBEZXJpdmVkIGZyb20gaHR0cHM6Ly9tYXRod29ybGQud29sZnJhbS5jb20vU3BoZXJlUG9pbnRQaWNraW5nLmh0bWxcblxuXHRcdGNvbnN0IHUgPSAoIE1hdGgucmFuZG9tKCkgLSAwLjUgKSAqIDI7XG5cdFx0Y29uc3QgdCA9IE1hdGgucmFuZG9tKCkgKiBNYXRoLlBJICogMjtcblx0XHRjb25zdCBmID0gTWF0aC5zcXJ0KCAxIC0gdSAqKiAyICk7XG5cblx0XHR0aGlzLnggPSBmICogTWF0aC5jb3MoIHQgKTtcblx0XHR0aGlzLnkgPSBmICogTWF0aC5zaW4oIHQgKTtcblx0XHR0aGlzLnogPSB1O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdCpbIFN5bWJvbC5pdGVyYXRvciBdKCkge1xuXG5cdFx0eWllbGQgdGhpcy54O1xuXHRcdHlpZWxkIHRoaXMueTtcblx0XHR5aWVsZCB0aGlzLno7XG5cblx0fVxuXG59XG5cbmNvbnN0IF92ZWN0b3IgPSAvKkBfX1BVUkVfXyovIG5ldyBWZWN0b3IzKCk7XG5jb25zdCBfcXVhdGVybmlvbiA9IC8qQF9fUFVSRV9fKi8gbmV3IFF1YXRlcm5pb24oKTtcblxuZXhwb3J0IHsgVmVjdG9yMyB9O1xuIiwiaW1wb3J0IHtcblx0RXZlbnREaXNwYXRjaGVyXG59IGZyb20gJy4uLy4uLy4uL3NyYy9jb3JlL0V2ZW50RGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQge1xuXHRRdWF0ZXJuaW9uXG59IGZyb20gJy4uLy4uLy4uL3NyYy9tYXRoL1F1YXRlcm5pb24uanMnO1xuaW1wb3J0IHtcblx0U3BoZXJpY2FsXG59IGZyb20gJy4uLy4uLy4uL3NyYy9tYXRoL1NwaGVyaWNhbC5qcyc7XG5pbXBvcnQge1xuXHRDbGFtcFRvRWRnZVdyYXBwaW5nLFxuXHREb3VibGVTaWRlLFxuXHRGcm9udFNpZGUsXG5cdEludGVycG9sYXRlRGlzY3JldGUsXG5cdEludGVycG9sYXRlTGluZWFyLFxuXHRMaW5lYXJGaWx0ZXIsXG5cdExpbmVhck1pcG1hcExpbmVhckZpbHRlcixcblx0TGluZWFyTWlwbWFwTmVhcmVzdEZpbHRlcixcblx0TWlycm9yZWRSZXBlYXRXcmFwcGluZyxcblx0TmVhcmVzdEZpbHRlcixcblx0TmVhcmVzdE1pcG1hcExpbmVhckZpbHRlcixcblx0TmVhcmVzdE1pcG1hcE5lYXJlc3RGaWx0ZXIsXG5cdFJlcGVhdFdyYXBwaW5nLFxuXHRUcmlhbmdsZUZhbkRyYXdNb2RlLFxuXHRUcmlhbmdsZVN0cmlwRHJhd01vZGUsXG5cdE1PVVNFLFxuXHRUT1VDSCxcbn0gZnJvbSAnLi4vLi4vLi4vc3JjL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQge1xuXHRWZWN0b3IyXG59IGZyb20gJy4uLy4uLy4uL3NyYy9tYXRoL1ZlY3RvcjIuanMnO1xuaW1wb3J0IHtcblx0VmVjdG9yM1xufSBmcm9tICcuLi8uLi8uLi9zcmMvbWF0aC9WZWN0b3IzLmpzJztcbi8vIE9yYml0Q29udHJvbHMgcGVyZm9ybXMgb3JiaXRpbmcsIGRvbGx5aW5nICh6b29taW5nKSwgYW5kIHBhbm5pbmcuXG4vLyBVbmxpa2UgVHJhY2tiYWxsQ29udHJvbHMsIGl0IG1haW50YWlucyB0aGUgXCJ1cFwiIGRpcmVjdGlvbiBvYmplY3QudXAgKCtZIGJ5IGRlZmF1bHQpLlxuLy9cbi8vICAgIE9yYml0IC0gbGVmdCBtb3VzZSAvIHRvdWNoOiBvbmUtZmluZ2VyIG1vdmVcbi8vICAgIFpvb20gLSBtaWRkbGUgbW91c2UsIG9yIG1vdXNld2hlZWwgLyB0b3VjaDogdHdvLWZpbmdlciBzcHJlYWQgb3Igc3F1aXNoXG4vLyAgICBQYW4gLSByaWdodCBtb3VzZSwgb3IgbGVmdCBtb3VzZSArIGN0cmwvbWV0YS9zaGlmdEtleSwgb3IgYXJyb3cga2V5cyAvIHRvdWNoOiB0d28tZmluZ2VyIG1vdmVcblxuY29uc3QgX2NoYW5nZUV2ZW50ID0geyB0eXBlOiAnY2hhbmdlJyB9O1xuY29uc3QgX3N0YXJ0RXZlbnQgPSB7IHR5cGU6ICdzdGFydCcgfTtcbmNvbnN0IF9lbmRFdmVudCA9IHsgdHlwZTogJ2VuZCcgfTtcblxuY2xhc3MgT3JiaXRDb250cm9scyBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlciB7XG5cblx0Y29uc3RydWN0b3Iob2JqZWN0LCBkb21FbGVtZW50KSB7XG5cblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5vYmplY3QgPSBvYmplY3Q7XG5cdFx0dGhpcy5kb21FbGVtZW50ID0gZG9tRWxlbWVudDtcblx0XHR0aGlzLmRvbUVsZW1lbnQuc3R5bGUudG91Y2hBY3Rpb24gPSAnbm9uZSc7IC8vIGRpc2FibGUgdG91Y2ggc2Nyb2xsXG5cblx0XHQvLyBTZXQgdG8gZmFsc2UgdG8gZGlzYWJsZSB0aGlzIGNvbnRyb2xcblx0XHR0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG5cdFx0Ly8gXCJ0YXJnZXRcIiBzZXRzIHRoZSBsb2NhdGlvbiBvZiBmb2N1cywgd2hlcmUgdGhlIG9iamVjdCBvcmJpdHMgYXJvdW5kXG5cdFx0dGhpcy50YXJnZXQgPSBuZXcgVmVjdG9yMygpO1xuXG5cdFx0Ly8gSG93IGZhciB5b3UgY2FuIGRvbGx5IGluIGFuZCBvdXQgKCBQZXJzcGVjdGl2ZUNhbWVyYSBvbmx5IClcblx0XHR0aGlzLm1pbkRpc3RhbmNlID0gMDtcblx0XHR0aGlzLm1heERpc3RhbmNlID0gSW5maW5pdHk7XG5cblx0XHQvLyBIb3cgZmFyIHlvdSBjYW4gem9vbSBpbiBhbmQgb3V0ICggT3J0aG9ncmFwaGljQ2FtZXJhIG9ubHkgKVxuXHRcdHRoaXMubWluWm9vbSA9IDA7XG5cdFx0dGhpcy5tYXhab29tID0gSW5maW5pdHk7XG5cblx0XHQvLyBIb3cgZmFyIHlvdSBjYW4gb3JiaXQgdmVydGljYWxseSwgdXBwZXIgYW5kIGxvd2VyIGxpbWl0cy5cblx0XHQvLyBSYW5nZSBpcyAwIHRvIE1hdGguUEkgcmFkaWFucy5cblx0XHR0aGlzLm1pblBvbGFyQW5nbGUgPSAwOyAvLyByYWRpYW5zXG5cdFx0dGhpcy5tYXhQb2xhckFuZ2xlID0gTWF0aC5QSTsgLy8gcmFkaWFuc1xuXG5cdFx0Ly8gSG93IGZhciB5b3UgY2FuIG9yYml0IGhvcml6b250YWxseSwgdXBwZXIgYW5kIGxvd2VyIGxpbWl0cy5cblx0XHQvLyBJZiBzZXQsIHRoZSBpbnRlcnZhbCBbIG1pbiwgbWF4IF0gbXVzdCBiZSBhIHN1Yi1pbnRlcnZhbCBvZiBbIC0gMiBQSSwgMiBQSSBdLCB3aXRoICggbWF4IC0gbWluIDwgMiBQSSApXG5cdFx0dGhpcy5taW5BemltdXRoQW5nbGUgPSAtIEluZmluaXR5OyAvLyByYWRpYW5zXG5cdFx0dGhpcy5tYXhBemltdXRoQW5nbGUgPSBJbmZpbml0eTsgLy8gcmFkaWFuc1xuXG5cdFx0Ly8gU2V0IHRvIHRydWUgdG8gZW5hYmxlIGRhbXBpbmcgKGluZXJ0aWEpXG5cdFx0Ly8gSWYgZGFtcGluZyBpcyBlbmFibGVkLCB5b3UgbXVzdCBjYWxsIGNvbnRyb2xzLnVwZGF0ZSgpIGluIHlvdXIgYW5pbWF0aW9uIGxvb3Bcblx0XHR0aGlzLmVuYWJsZURhbXBpbmcgPSBmYWxzZTtcblx0XHR0aGlzLmRhbXBpbmdGYWN0b3IgPSAwLjA1O1xuXG5cdFx0Ly8gVGhpcyBvcHRpb24gYWN0dWFsbHkgZW5hYmxlcyBkb2xseWluZyBpbiBhbmQgb3V0OyBsZWZ0IGFzIFwiem9vbVwiIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cblx0XHQvLyBTZXQgdG8gZmFsc2UgdG8gZGlzYWJsZSB6b29taW5nXG5cdFx0dGhpcy5lbmFibGVab29tID0gdHJ1ZTtcblx0XHR0aGlzLnpvb21TcGVlZCA9IDEuMDtcblxuXHRcdC8vIFNldCB0byBmYWxzZSB0byBkaXNhYmxlIHJvdGF0aW5nXG5cdFx0dGhpcy5lbmFibGVSb3RhdGUgPSB0cnVlO1xuXHRcdHRoaXMucm90YXRlU3BlZWQgPSAxLjA7XG5cblx0XHQvLyBTZXQgdG8gZmFsc2UgdG8gZGlzYWJsZSBwYW5uaW5nXG5cdFx0dGhpcy5lbmFibGVQYW4gPSB0cnVlO1xuXHRcdHRoaXMucGFuU3BlZWQgPSAxLjA7XG5cdFx0dGhpcy5zY3JlZW5TcGFjZVBhbm5pbmcgPSB0cnVlOyAvLyBpZiBmYWxzZSwgcGFuIG9ydGhvZ29uYWwgdG8gd29ybGQtc3BhY2UgZGlyZWN0aW9uIGNhbWVyYS51cFxuXHRcdHRoaXMua2V5UGFuU3BlZWQgPSA3LjA7XHQvLyBwaXhlbHMgbW92ZWQgcGVyIGFycm93IGtleSBwdXNoXG5cblx0XHQvLyBTZXQgdG8gdHJ1ZSB0byBhdXRvbWF0aWNhbGx5IHJvdGF0ZSBhcm91bmQgdGhlIHRhcmdldFxuXHRcdC8vIElmIGF1dG8tcm90YXRlIGlzIGVuYWJsZWQsIHlvdSBtdXN0IGNhbGwgY29udHJvbHMudXBkYXRlKCkgaW4geW91ciBhbmltYXRpb24gbG9vcFxuXHRcdHRoaXMuYXV0b1JvdGF0ZSA9IGZhbHNlO1xuXHRcdHRoaXMuYXV0b1JvdGF0ZVNwZWVkID0gMi4wOyAvLyAzMCBzZWNvbmRzIHBlciBvcmJpdCB3aGVuIGZwcyBpcyA2MFxuXG5cdFx0Ly8gVGhlIGZvdXIgYXJyb3cga2V5c1xuXHRcdHRoaXMua2V5cyA9IHsgTEVGVDogJ0Fycm93TGVmdCcsIFVQOiAnQXJyb3dVcCcsIFJJR0hUOiAnQXJyb3dSaWdodCcsIEJPVFRPTTogJ0Fycm93RG93bicgfTtcblxuXHRcdC8vIE1vdXNlIGJ1dHRvbnNcblx0XHR0aGlzLm1vdXNlQnV0dG9ucyA9IHsgTEVGVDogTU9VU0UuUk9UQVRFLCBNSURETEU6IE1PVVNFLkRPTExZLCBSSUdIVDogTU9VU0UuUEFOIH07XG5cblx0XHQvLyBUb3VjaCBmaW5nZXJzXG5cdFx0dGhpcy50b3VjaGVzID0geyBPTkU6IFRPVUNILlJPVEFURSwgVFdPOiBUT1VDSC5ET0xMWV9QQU4gfTtcblxuXHRcdC8vIGZvciByZXNldFxuXHRcdHRoaXMudGFyZ2V0MCA9IHRoaXMudGFyZ2V0LmNsb25lKCk7XG5cdFx0dGhpcy5wb3NpdGlvbjAgPSB0aGlzLm9iamVjdC5wb3NpdGlvbi5jbG9uZSgpO1xuXHRcdHRoaXMuem9vbTAgPSB0aGlzLm9iamVjdC56b29tO1xuXG5cdFx0Ly8gdGhlIHRhcmdldCBET00gZWxlbWVudCBmb3Iga2V5IGV2ZW50c1xuXHRcdHRoaXMuX2RvbUVsZW1lbnRLZXlFdmVudHMgPSBudWxsO1xuXG5cdFx0Ly9cblx0XHQvLyBwdWJsaWMgbWV0aG9kc1xuXHRcdC8vXG5cblx0XHR0aGlzLmdldFBvbGFyQW5nbGUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdHJldHVybiBzcGhlcmljYWwucGhpO1xuXG5cdFx0fTtcblxuXHRcdHRoaXMuZ2V0QXppbXV0aGFsQW5nbGUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdHJldHVybiBzcGhlcmljYWwudGhldGE7XG5cblx0XHR9O1xuXG5cdFx0dGhpcy5nZXREaXN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0cmV0dXJuIHRoaXMub2JqZWN0LnBvc2l0aW9uLmRpc3RhbmNlVG8odGhpcy50YXJnZXQpO1xuXG5cdFx0fTtcblxuXHRcdHRoaXMubGlzdGVuVG9LZXlFdmVudHMgPSBmdW5jdGlvbiAoZG9tRWxlbWVudCkge1xuXG5cdFx0XHRkb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleURvd24pO1xuXHRcdFx0dGhpcy5fZG9tRWxlbWVudEtleUV2ZW50cyA9IGRvbUVsZW1lbnQ7XG5cblx0XHR9O1xuXG5cdFx0dGhpcy5zdG9wTGlzdGVuVG9LZXlFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdHRoaXMuX2RvbUVsZW1lbnRLZXlFdmVudHMucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5RG93bik7XG5cdFx0XHR0aGlzLl9kb21FbGVtZW50S2V5RXZlbnRzID0gbnVsbDtcblxuXHRcdH07XG5cblx0XHR0aGlzLnNhdmVTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0c2NvcGUudGFyZ2V0MC5jb3B5KHNjb3BlLnRhcmdldCk7XG5cdFx0XHRzY29wZS5wb3NpdGlvbjAuY29weShzY29wZS5vYmplY3QucG9zaXRpb24pO1xuXHRcdFx0c2NvcGUuem9vbTAgPSBzY29wZS5vYmplY3Quem9vbTtcblxuXHRcdH07XG5cblx0XHR0aGlzLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRzY29wZS50YXJnZXQuY29weShzY29wZS50YXJnZXQwKTtcblx0XHRcdHNjb3BlLm9iamVjdC5wb3NpdGlvbi5jb3B5KHNjb3BlLnBvc2l0aW9uMCk7XG5cdFx0XHRzY29wZS5vYmplY3Quem9vbSA9IHNjb3BlLnpvb20wO1xuXG5cdFx0XHRzY29wZS5vYmplY3QudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuXHRcdFx0c2NvcGUuZGlzcGF0Y2hFdmVudChfY2hhbmdlRXZlbnQpO1xuXG5cdFx0XHRzY29wZS51cGRhdGUoKTtcblxuXHRcdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0fTtcblxuXHRcdC8vIHRoaXMgbWV0aG9kIGlzIGV4cG9zZWQsIGJ1dCBwZXJoYXBzIGl0IHdvdWxkIGJlIGJldHRlciBpZiB3ZSBjYW4gbWFrZSBpdCBwcml2YXRlLi4uXG5cdFx0dGhpcy51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdGNvbnN0IG9mZnNldCA9IG5ldyBWZWN0b3IzKCk7XG5cblx0XHRcdC8vIHNvIGNhbWVyYS51cCBpcyB0aGUgb3JiaXQgYXhpc1xuXHRcdFx0Y29uc3QgcXVhdCA9IG5ldyBRdWF0ZXJuaW9uKCkuc2V0RnJvbVVuaXRWZWN0b3JzKG9iamVjdC51cCwgbmV3IFZlY3RvcjMoMCwgMSwgMCkpO1xuXHRcdFx0Y29uc3QgcXVhdEludmVyc2UgPSBxdWF0LmNsb25lKCkuaW52ZXJ0KCk7XG5cblx0XHRcdGNvbnN0IGxhc3RQb3NpdGlvbiA9IG5ldyBWZWN0b3IzKCk7XG5cdFx0XHRjb25zdCBsYXN0UXVhdGVybmlvbiA9IG5ldyBRdWF0ZXJuaW9uKCk7XG5cdFx0XHRjb25zdCBsYXN0VGFyZ2V0UG9zaXRpb24gPSBuZXcgVmVjdG9yMygpO1xuXG5cdFx0XHRjb25zdCB0d29QSSA9IDIgKiBNYXRoLlBJO1xuXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlKCkge1xuXG5cdFx0XHRcdGNvbnN0IHBvc2l0aW9uID0gc2NvcGUub2JqZWN0LnBvc2l0aW9uO1xuXG5cdFx0XHRcdG9mZnNldC5jb3B5KHBvc2l0aW9uKS5zdWIoc2NvcGUudGFyZ2V0KTtcblxuXHRcdFx0XHQvLyByb3RhdGUgb2Zmc2V0IHRvIFwieS1heGlzLWlzLXVwXCIgc3BhY2Vcblx0XHRcdFx0b2Zmc2V0LmFwcGx5UXVhdGVybmlvbihxdWF0KTtcblxuXHRcdFx0XHQvLyBhbmdsZSBmcm9tIHotYXhpcyBhcm91bmQgeS1heGlzXG5cdFx0XHRcdHNwaGVyaWNhbC5zZXRGcm9tVmVjdG9yMyhvZmZzZXQpO1xuXG5cdFx0XHRcdGlmIChzY29wZS5hdXRvUm90YXRlICYmIHN0YXRlID09PSBTVEFURS5OT05FKSB7XG5cblx0XHRcdFx0XHRyb3RhdGVMZWZ0KGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCkpO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoc2NvcGUuZW5hYmxlRGFtcGluZykge1xuXG5cdFx0XHRcdFx0c3BoZXJpY2FsLnRoZXRhICs9IHNwaGVyaWNhbERlbHRhLnRoZXRhICogc2NvcGUuZGFtcGluZ0ZhY3Rvcjtcblx0XHRcdFx0XHRzcGhlcmljYWwucGhpICs9IHNwaGVyaWNhbERlbHRhLnBoaSAqIHNjb3BlLmRhbXBpbmdGYWN0b3I7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdHNwaGVyaWNhbC50aGV0YSArPSBzcGhlcmljYWxEZWx0YS50aGV0YTtcblx0XHRcdFx0XHRzcGhlcmljYWwucGhpICs9IHNwaGVyaWNhbERlbHRhLnBoaTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gcmVzdHJpY3QgdGhldGEgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuXG5cdFx0XHRcdGxldCBtaW4gPSBzY29wZS5taW5BemltdXRoQW5nbGU7XG5cdFx0XHRcdGxldCBtYXggPSBzY29wZS5tYXhBemltdXRoQW5nbGU7XG5cblx0XHRcdFx0aWYgKGlzRmluaXRlKG1pbikgJiYgaXNGaW5pdGUobWF4KSkge1xuXG5cdFx0XHRcdFx0aWYgKG1pbiA8IC0gTWF0aC5QSSkgbWluICs9IHR3b1BJOyBlbHNlIGlmIChtaW4gPiBNYXRoLlBJKSBtaW4gLT0gdHdvUEk7XG5cblx0XHRcdFx0XHRpZiAobWF4IDwgLSBNYXRoLlBJKSBtYXggKz0gdHdvUEk7IGVsc2UgaWYgKG1heCA+IE1hdGguUEkpIG1heCAtPSB0d29QSTtcblxuXHRcdFx0XHRcdGlmIChtaW4gPD0gbWF4KSB7XG5cblx0XHRcdFx0XHRcdHNwaGVyaWNhbC50aGV0YSA9IE1hdGgubWF4KG1pbiwgTWF0aC5taW4obWF4LCBzcGhlcmljYWwudGhldGEpKTtcblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdHNwaGVyaWNhbC50aGV0YSA9IChzcGhlcmljYWwudGhldGEgPiAobWluICsgbWF4KSAvIDIpID9cblx0XHRcdFx0XHRcdFx0TWF0aC5tYXgobWluLCBzcGhlcmljYWwudGhldGEpIDpcblx0XHRcdFx0XHRcdFx0TWF0aC5taW4obWF4LCBzcGhlcmljYWwudGhldGEpO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyByZXN0cmljdCBwaGkgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuXHRcdFx0XHRzcGhlcmljYWwucGhpID0gTWF0aC5tYXgoc2NvcGUubWluUG9sYXJBbmdsZSwgTWF0aC5taW4oc2NvcGUubWF4UG9sYXJBbmdsZSwgc3BoZXJpY2FsLnBoaSkpO1xuXG5cdFx0XHRcdHNwaGVyaWNhbC5tYWtlU2FmZSgpO1xuXG5cblx0XHRcdFx0c3BoZXJpY2FsLnJhZGl1cyAqPSBzY2FsZTtcblxuXHRcdFx0XHQvLyByZXN0cmljdCByYWRpdXMgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuXHRcdFx0XHRzcGhlcmljYWwucmFkaXVzID0gTWF0aC5tYXgoc2NvcGUubWluRGlzdGFuY2UsIE1hdGgubWluKHNjb3BlLm1heERpc3RhbmNlLCBzcGhlcmljYWwucmFkaXVzKSk7XG5cblx0XHRcdFx0Ly8gbW92ZSB0YXJnZXQgdG8gcGFubmVkIGxvY2F0aW9uXG5cblx0XHRcdFx0aWYgKHNjb3BlLmVuYWJsZURhbXBpbmcgPT09IHRydWUpIHtcblxuXHRcdFx0XHRcdHNjb3BlLnRhcmdldC5hZGRTY2FsZWRWZWN0b3IocGFuT2Zmc2V0LCBzY29wZS5kYW1waW5nRmFjdG9yKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0c2NvcGUudGFyZ2V0LmFkZChwYW5PZmZzZXQpO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRvZmZzZXQuc2V0RnJvbVNwaGVyaWNhbChzcGhlcmljYWwpO1xuXG5cdFx0XHRcdC8vIHJvdGF0ZSBvZmZzZXQgYmFjayB0byBcImNhbWVyYS11cC12ZWN0b3ItaXMtdXBcIiBzcGFjZVxuXHRcdFx0XHRvZmZzZXQuYXBwbHlRdWF0ZXJuaW9uKHF1YXRJbnZlcnNlKTtcblxuXHRcdFx0XHRwb3NpdGlvbi5jb3B5KHNjb3BlLnRhcmdldCkuYWRkKG9mZnNldCk7XG5cblx0XHRcdFx0c2NvcGUub2JqZWN0Lmxvb2tBdChzY29wZS50YXJnZXQpO1xuXG5cdFx0XHRcdGlmIChzY29wZS5lbmFibGVEYW1waW5nID09PSB0cnVlKSB7XG5cblx0XHRcdFx0XHRzcGhlcmljYWxEZWx0YS50aGV0YSAqPSAoMSAtIHNjb3BlLmRhbXBpbmdGYWN0b3IpO1xuXHRcdFx0XHRcdHNwaGVyaWNhbERlbHRhLnBoaSAqPSAoMSAtIHNjb3BlLmRhbXBpbmdGYWN0b3IpO1xuXG5cdFx0XHRcdFx0cGFuT2Zmc2V0Lm11bHRpcGx5U2NhbGFyKDEgLSBzY29wZS5kYW1waW5nRmFjdG9yKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0c3BoZXJpY2FsRGVsdGEuc2V0KDAsIDAsIDApO1xuXG5cdFx0XHRcdFx0cGFuT2Zmc2V0LnNldCgwLCAwLCAwKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0c2NhbGUgPSAxO1xuXG5cdFx0XHRcdC8vIHVwZGF0ZSBjb25kaXRpb24gaXM6XG5cdFx0XHRcdC8vIG1pbihjYW1lcmEgZGlzcGxhY2VtZW50LCBjYW1lcmEgcm90YXRpb24gaW4gcmFkaWFucyleMiA+IEVQU1xuXHRcdFx0XHQvLyB1c2luZyBzbWFsbC1hbmdsZSBhcHByb3hpbWF0aW9uIGNvcyh4LzIpID0gMSAtIHheMiAvIDhcblxuXHRcdFx0XHRpZiAoem9vbUNoYW5nZWQgfHxcblx0XHRcdFx0XHRsYXN0UG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoc2NvcGUub2JqZWN0LnBvc2l0aW9uKSA+IEVQUyB8fFxuXHRcdFx0XHRcdDggKiAoMSAtIGxhc3RRdWF0ZXJuaW9uLmRvdChzY29wZS5vYmplY3QucXVhdGVybmlvbikpID4gRVBTIHx8XG5cdFx0XHRcdFx0bGFzdFRhcmdldFBvc2l0aW9uLmRpc3RhbmNlVG9TcXVhcmVkKHNjb3BlLnRhcmdldCkgPiAwKSB7XG5cblx0XHRcdFx0XHRzY29wZS5kaXNwYXRjaEV2ZW50KF9jaGFuZ2VFdmVudCk7XG5cblx0XHRcdFx0XHRsYXN0UG9zaXRpb24uY29weShzY29wZS5vYmplY3QucG9zaXRpb24pO1xuXHRcdFx0XHRcdGxhc3RRdWF0ZXJuaW9uLmNvcHkoc2NvcGUub2JqZWN0LnF1YXRlcm5pb24pO1xuXHRcdFx0XHRcdGxhc3RUYXJnZXRQb3NpdGlvbi5jb3B5KHNjb3BlLnRhcmdldCk7XG5cblx0XHRcdFx0XHR6b29tQ2hhbmdlZCA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdFx0fTtcblxuXHRcdH0oKTtcblxuXHRcdHRoaXMuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0c2NvcGUuZG9tRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIG9uQ29udGV4dE1lbnUpO1xuXG5cdFx0XHRzY29wZS5kb21FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgb25Qb2ludGVyRG93bik7XG5cdFx0XHRzY29wZS5kb21FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJjYW5jZWwnLCBvblBvaW50ZXJVcCk7XG5cdFx0XHRzY29wZS5kb21FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25Nb3VzZVdoZWVsKTtcblxuXHRcdFx0c2NvcGUuZG9tRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIG9uUG9pbnRlck1vdmUpO1xuXHRcdFx0c2NvcGUuZG9tRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVydXAnLCBvblBvaW50ZXJVcCk7XG5cblxuXHRcdFx0aWYgKHNjb3BlLl9kb21FbGVtZW50S2V5RXZlbnRzICE9PSBudWxsKSB7XG5cblx0XHRcdFx0c2NvcGUuX2RvbUVsZW1lbnRLZXlFdmVudHMucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5RG93bik7XG5cdFx0XHRcdHNjb3BlLl9kb21FbGVtZW50S2V5RXZlbnRzID0gbnVsbDtcblxuXHRcdFx0fVxuXG5cdFx0XHQvL3Njb3BlLmRpc3BhdGNoRXZlbnQoIHsgdHlwZTogJ2Rpc3Bvc2UnIH0gKTsgLy8gc2hvdWxkIHRoaXMgYmUgYWRkZWQgaGVyZT9cblxuXHRcdH07XG5cblx0XHQvL1xuXHRcdC8vIGludGVybmFsc1xuXHRcdC8vXG5cblx0XHRjb25zdCBzY29wZSA9IHRoaXM7XG5cblx0XHRjb25zdCBTVEFURSA9IHtcblx0XHRcdE5PTkU6IC0gMSxcblx0XHRcdFJPVEFURTogMCxcblx0XHRcdERPTExZOiAxLFxuXHRcdFx0UEFOOiAyLFxuXHRcdFx0VE9VQ0hfUk9UQVRFOiAzLFxuXHRcdFx0VE9VQ0hfUEFOOiA0LFxuXHRcdFx0VE9VQ0hfRE9MTFlfUEFOOiA1LFxuXHRcdFx0VE9VQ0hfRE9MTFlfUk9UQVRFOiA2XG5cdFx0fTtcblxuXHRcdGxldCBzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHRjb25zdCBFUFMgPSAwLjAwMDAwMTtcblxuXHRcdC8vIGN1cnJlbnQgcG9zaXRpb24gaW4gc3BoZXJpY2FsIGNvb3JkaW5hdGVzXG5cdFx0Y29uc3Qgc3BoZXJpY2FsID0gbmV3IFNwaGVyaWNhbCgpO1xuXHRcdGNvbnN0IHNwaGVyaWNhbERlbHRhID0gbmV3IFNwaGVyaWNhbCgpO1xuXG5cdFx0bGV0IHNjYWxlID0gMTtcblx0XHRjb25zdCBwYW5PZmZzZXQgPSBuZXcgVmVjdG9yMygpO1xuXHRcdGxldCB6b29tQ2hhbmdlZCA9IGZhbHNlO1xuXG5cdFx0Y29uc3Qgcm90YXRlU3RhcnQgPSBuZXcgVmVjdG9yMigpO1xuXHRcdGNvbnN0IHJvdGF0ZUVuZCA9IG5ldyBWZWN0b3IyKCk7XG5cdFx0Y29uc3Qgcm90YXRlRGVsdGEgPSBuZXcgVmVjdG9yMigpO1xuXG5cdFx0Y29uc3QgcGFuU3RhcnQgPSBuZXcgVmVjdG9yMigpO1xuXHRcdGNvbnN0IHBhbkVuZCA9IG5ldyBWZWN0b3IyKCk7XG5cdFx0Y29uc3QgcGFuRGVsdGEgPSBuZXcgVmVjdG9yMigpO1xuXG5cdFx0Y29uc3QgZG9sbHlTdGFydCA9IG5ldyBWZWN0b3IyKCk7XG5cdFx0Y29uc3QgZG9sbHlFbmQgPSBuZXcgVmVjdG9yMigpO1xuXHRcdGNvbnN0IGRvbGx5RGVsdGEgPSBuZXcgVmVjdG9yMigpO1xuXG5cdFx0Y29uc3QgcG9pbnRlcnMgPSBbXTtcblx0XHRjb25zdCBwb2ludGVyUG9zaXRpb25zID0ge307XG5cblx0XHRmdW5jdGlvbiBnZXRBdXRvUm90YXRpb25BbmdsZSgpIHtcblxuXHRcdFx0cmV0dXJuIDIgKiBNYXRoLlBJIC8gNjAgLyA2MCAqIHNjb3BlLmF1dG9Sb3RhdGVTcGVlZDtcblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGdldFpvb21TY2FsZSgpIHtcblxuXHRcdFx0cmV0dXJuIE1hdGgucG93KDAuOTUsIHNjb3BlLnpvb21TcGVlZCk7XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiByb3RhdGVMZWZ0KGFuZ2xlKSB7XG5cblx0XHRcdHNwaGVyaWNhbERlbHRhLnRoZXRhIC09IGFuZ2xlO1xuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcm90YXRlVXAoYW5nbGUpIHtcblxuXHRcdFx0c3BoZXJpY2FsRGVsdGEucGhpIC09IGFuZ2xlO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgcGFuTGVmdCA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0Y29uc3QgdiA9IG5ldyBWZWN0b3IzKCk7XG5cblx0XHRcdHJldHVybiBmdW5jdGlvbiBwYW5MZWZ0KGRpc3RhbmNlLCBvYmplY3RNYXRyaXgpIHtcblxuXHRcdFx0XHR2LnNldEZyb21NYXRyaXhDb2x1bW4ob2JqZWN0TWF0cml4LCAwKTsgLy8gZ2V0IFggY29sdW1uIG9mIG9iamVjdE1hdHJpeFxuXHRcdFx0XHR2Lm11bHRpcGx5U2NhbGFyKC0gZGlzdGFuY2UpO1xuXG5cdFx0XHRcdHBhbk9mZnNldC5hZGQodik7XG5cblx0XHRcdH07XG5cblx0XHR9KCk7XG5cblx0XHRjb25zdCBwYW5VcCA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0Y29uc3QgdiA9IG5ldyBWZWN0b3IzKCk7XG5cblx0XHRcdHJldHVybiBmdW5jdGlvbiBwYW5VcChkaXN0YW5jZSwgb2JqZWN0TWF0cml4KSB7XG5cblx0XHRcdFx0aWYgKHNjb3BlLnNjcmVlblNwYWNlUGFubmluZyA9PT0gdHJ1ZSkge1xuXG5cdFx0XHRcdFx0di5zZXRGcm9tTWF0cml4Q29sdW1uKG9iamVjdE1hdHJpeCwgMSk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdHYuc2V0RnJvbU1hdHJpeENvbHVtbihvYmplY3RNYXRyaXgsIDApO1xuXHRcdFx0XHRcdHYuY3Jvc3NWZWN0b3JzKHNjb3BlLm9iamVjdC51cCwgdik7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHYubXVsdGlwbHlTY2FsYXIoZGlzdGFuY2UpO1xuXG5cdFx0XHRcdHBhbk9mZnNldC5hZGQodik7XG5cblx0XHRcdH07XG5cblx0XHR9KCk7XG5cblx0XHQvLyBkZWx0YVggYW5kIGRlbHRhWSBhcmUgaW4gcGl4ZWxzOyByaWdodCBhbmQgZG93biBhcmUgcG9zaXRpdmVcblx0XHRjb25zdCBwYW4gPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdGNvbnN0IG9mZnNldCA9IG5ldyBWZWN0b3IzKCk7XG5cblx0XHRcdHJldHVybiBmdW5jdGlvbiBwYW4oZGVsdGFYLCBkZWx0YVkpIHtcblxuXHRcdFx0XHRjb25zdCBlbGVtZW50ID0gc2NvcGUuZG9tRWxlbWVudDtcblxuXHRcdFx0XHRpZiAoc2NvcGUub2JqZWN0LmlzUGVyc3BlY3RpdmVDYW1lcmEpIHtcblxuXHRcdFx0XHRcdC8vIHBlcnNwZWN0aXZlXG5cdFx0XHRcdFx0Y29uc3QgcG9zaXRpb24gPSBzY29wZS5vYmplY3QucG9zaXRpb247XG5cdFx0XHRcdFx0b2Zmc2V0LmNvcHkocG9zaXRpb24pLnN1YihzY29wZS50YXJnZXQpO1xuXHRcdFx0XHRcdGxldCB0YXJnZXREaXN0YW5jZSA9IG9mZnNldC5sZW5ndGgoKTtcblxuXHRcdFx0XHRcdC8vIGhhbGYgb2YgdGhlIGZvdiBpcyBjZW50ZXIgdG8gdG9wIG9mIHNjcmVlblxuXHRcdFx0XHRcdHRhcmdldERpc3RhbmNlICo9IE1hdGgudGFuKChzY29wZS5vYmplY3QuZm92IC8gMikgKiBNYXRoLlBJIC8gMTgwLjApO1xuXG5cdFx0XHRcdFx0Ly8gd2UgdXNlIG9ubHkgY2xpZW50SGVpZ2h0IGhlcmUgc28gYXNwZWN0IHJhdGlvIGRvZXMgbm90IGRpc3RvcnQgc3BlZWRcblx0XHRcdFx0XHRwYW5MZWZ0KDIgKiBkZWx0YVggKiB0YXJnZXREaXN0YW5jZSAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0LCBzY29wZS5vYmplY3QubWF0cml4KTtcblx0XHRcdFx0XHRwYW5VcCgyICogZGVsdGFZICogdGFyZ2V0RGlzdGFuY2UgLyBlbGVtZW50LmNsaWVudEhlaWdodCwgc2NvcGUub2JqZWN0Lm1hdHJpeCk7XG5cblx0XHRcdFx0fSBlbHNlIGlmIChzY29wZS5vYmplY3QuaXNPcnRob2dyYXBoaWNDYW1lcmEpIHtcblxuXHRcdFx0XHRcdC8vIG9ydGhvZ3JhcGhpY1xuXHRcdFx0XHRcdHBhbkxlZnQoZGVsdGFYICogKHNjb3BlLm9iamVjdC5yaWdodCAtIHNjb3BlLm9iamVjdC5sZWZ0KSAvIHNjb3BlLm9iamVjdC56b29tIC8gZWxlbWVudC5jbGllbnRXaWR0aCwgc2NvcGUub2JqZWN0Lm1hdHJpeCk7XG5cdFx0XHRcdFx0cGFuVXAoZGVsdGFZICogKHNjb3BlLm9iamVjdC50b3AgLSBzY29wZS5vYmplY3QuYm90dG9tKSAvIHNjb3BlLm9iamVjdC56b29tIC8gZWxlbWVudC5jbGllbnRIZWlnaHQsIHNjb3BlLm9iamVjdC5tYXRyaXgpO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHQvLyBjYW1lcmEgbmVpdGhlciBvcnRob2dyYXBoaWMgbm9yIHBlcnNwZWN0aXZlXG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKCdXQVJOSU5HOiBPcmJpdENvbnRyb2xzLmpzIGVuY291bnRlcmVkIGFuIHVua25vd24gY2FtZXJhIHR5cGUgLSBwYW4gZGlzYWJsZWQuJyk7XG5cdFx0XHRcdFx0c2NvcGUuZW5hYmxlUGFuID0gZmFsc2U7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9O1xuXG5cdFx0fSgpO1xuXG5cdFx0ZnVuY3Rpb24gZG9sbHlPdXQoZG9sbHlTY2FsZSkge1xuXG5cdFx0XHRpZiAoc2NvcGUub2JqZWN0LmlzUGVyc3BlY3RpdmVDYW1lcmEpIHtcblxuXHRcdFx0XHRzY2FsZSAvPSBkb2xseVNjYWxlO1xuXG5cdFx0XHR9IGVsc2UgaWYgKHNjb3BlLm9iamVjdC5pc09ydGhvZ3JhcGhpY0NhbWVyYSkge1xuXG5cdFx0XHRcdHNjb3BlLm9iamVjdC56b29tID0gTWF0aC5tYXgoc2NvcGUubWluWm9vbSwgTWF0aC5taW4oc2NvcGUubWF4Wm9vbSwgc2NvcGUub2JqZWN0Lnpvb20gKiBkb2xseVNjYWxlKSk7XG5cdFx0XHRcdHNjb3BlLm9iamVjdC51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cdFx0XHRcdHpvb21DaGFuZ2VkID0gdHJ1ZTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRjb25zb2xlLndhcm4oJ1dBUk5JTkc6IE9yYml0Q29udHJvbHMuanMgZW5jb3VudGVyZWQgYW4gdW5rbm93biBjYW1lcmEgdHlwZSAtIGRvbGx5L3pvb20gZGlzYWJsZWQuJyk7XG5cdFx0XHRcdHNjb3BlLmVuYWJsZVpvb20gPSBmYWxzZTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZG9sbHlJbihkb2xseVNjYWxlKSB7XG5cblx0XHRcdGlmIChzY29wZS5vYmplY3QuaXNQZXJzcGVjdGl2ZUNhbWVyYSkge1xuXG5cdFx0XHRcdHNjYWxlICo9IGRvbGx5U2NhbGU7XG5cblx0XHRcdH0gZWxzZSBpZiAoc2NvcGUub2JqZWN0LmlzT3J0aG9ncmFwaGljQ2FtZXJhKSB7XG5cblx0XHRcdFx0c2NvcGUub2JqZWN0Lnpvb20gPSBNYXRoLm1heChzY29wZS5taW5ab29tLCBNYXRoLm1pbihzY29wZS5tYXhab29tLCBzY29wZS5vYmplY3Quem9vbSAvIGRvbGx5U2NhbGUpKTtcblx0XHRcdFx0c2NvcGUub2JqZWN0LnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcblx0XHRcdFx0em9vbUNoYW5nZWQgPSB0cnVlO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGNvbnNvbGUud2FybignV0FSTklORzogT3JiaXRDb250cm9scy5qcyBlbmNvdW50ZXJlZCBhbiB1bmtub3duIGNhbWVyYSB0eXBlIC0gZG9sbHkvem9vbSBkaXNhYmxlZC4nKTtcblx0XHRcdFx0c2NvcGUuZW5hYmxlWm9vbSA9IGZhbHNlO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHQvL1xuXHRcdC8vIGV2ZW50IGNhbGxiYWNrcyAtIHVwZGF0ZSB0aGUgb2JqZWN0IHN0YXRlXG5cdFx0Ly9cblxuXHRcdGZ1bmN0aW9uIGhhbmRsZU1vdXNlRG93blJvdGF0ZShldmVudCkge1xuXG5cdFx0XHRyb3RhdGVTdGFydC5zZXQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBoYW5kbGVNb3VzZURvd25Eb2xseShldmVudCkge1xuXG5cdFx0XHRkb2xseVN0YXJ0LnNldChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGhhbmRsZU1vdXNlRG93blBhbihldmVudCkge1xuXG5cdFx0XHRwYW5TdGFydC5zZXQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBoYW5kbGVNb3VzZU1vdmVSb3RhdGUoZXZlbnQpIHtcblxuXHRcdFx0cm90YXRlRW5kLnNldChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcblxuXHRcdFx0cm90YXRlRGVsdGEuc3ViVmVjdG9ycyhyb3RhdGVFbmQsIHJvdGF0ZVN0YXJ0KS5tdWx0aXBseVNjYWxhcihzY29wZS5yb3RhdGVTcGVlZCk7XG5cblx0XHRcdGNvbnN0IGVsZW1lbnQgPSBzY29wZS5kb21FbGVtZW50O1xuXG5cdFx0XHRyb3RhdGVMZWZ0KDIgKiBNYXRoLlBJICogcm90YXRlRGVsdGEueCAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0KTsgLy8geWVzLCBoZWlnaHRcblxuXHRcdFx0cm90YXRlVXAoMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS55IC8gZWxlbWVudC5jbGllbnRIZWlnaHQpO1xuXG5cdFx0XHRyb3RhdGVTdGFydC5jb3B5KHJvdGF0ZUVuZCk7XG5cblx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gaGFuZGxlTW91c2VNb3ZlRG9sbHkoZXZlbnQpIHtcblxuXHRcdFx0ZG9sbHlFbmQuc2V0KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuXG5cdFx0XHRkb2xseURlbHRhLnN1YlZlY3RvcnMoZG9sbHlFbmQsIGRvbGx5U3RhcnQpO1xuXG5cdFx0XHRpZiAoZG9sbHlEZWx0YS55ID4gMCkge1xuXG5cdFx0XHRcdGRvbGx5T3V0KGdldFpvb21TY2FsZSgpKTtcblxuXHRcdFx0fSBlbHNlIGlmIChkb2xseURlbHRhLnkgPCAwKSB7XG5cblx0XHRcdFx0ZG9sbHlJbihnZXRab29tU2NhbGUoKSk7XG5cblx0XHRcdH1cblxuXHRcdFx0ZG9sbHlTdGFydC5jb3B5KGRvbGx5RW5kKTtcblxuXHRcdFx0c2NvcGUudXBkYXRlKCk7XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBoYW5kbGVNb3VzZU1vdmVQYW4oZXZlbnQpIHtcblxuXHRcdFx0cGFuRW5kLnNldChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcblxuXHRcdFx0cGFuRGVsdGEuc3ViVmVjdG9ycyhwYW5FbmQsIHBhblN0YXJ0KS5tdWx0aXBseVNjYWxhcihzY29wZS5wYW5TcGVlZCk7XG5cblx0XHRcdHBhbihwYW5EZWx0YS54LCBwYW5EZWx0YS55KTtcblxuXHRcdFx0cGFuU3RhcnQuY29weShwYW5FbmQpO1xuXG5cdFx0XHRzY29wZS51cGRhdGUoKTtcblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGhhbmRsZU1vdXNlV2hlZWwoZXZlbnQpIHtcblxuXHRcdFx0aWYgKGV2ZW50LmRlbHRhWSA8IDApIHtcblxuXHRcdFx0XHRkb2xseUluKGdldFpvb21TY2FsZSgpKTtcblxuXHRcdFx0fSBlbHNlIGlmIChldmVudC5kZWx0YVkgPiAwKSB7XG5cblx0XHRcdFx0ZG9sbHlPdXQoZ2V0Wm9vbVNjYWxlKCkpO1xuXG5cdFx0XHR9XG5cblx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gaGFuZGxlS2V5RG93bihldmVudCkge1xuXG5cdFx0XHRsZXQgbmVlZHNVcGRhdGUgPSBmYWxzZTtcblxuXHRcdFx0c3dpdGNoIChldmVudC5jb2RlKSB7XG5cblx0XHRcdFx0Y2FzZSBzY29wZS5rZXlzLlVQOlxuXG5cdFx0XHRcdFx0aWYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSB8fCBldmVudC5zaGlmdEtleSkge1xuXG5cdFx0XHRcdFx0XHRyb3RhdGVVcCgyICogTWF0aC5QSSAqIHNjb3BlLnJvdGF0ZVNwZWVkIC8gc2NvcGUuZG9tRWxlbWVudC5jbGllbnRIZWlnaHQpO1xuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0cGFuKDAsIHNjb3BlLmtleVBhblNwZWVkKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIHNjb3BlLmtleXMuQk9UVE9NOlxuXG5cdFx0XHRcdFx0aWYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSB8fCBldmVudC5zaGlmdEtleSkge1xuXG5cdFx0XHRcdFx0XHRyb3RhdGVVcCgtIDIgKiBNYXRoLlBJICogc2NvcGUucm90YXRlU3BlZWQgLyBzY29wZS5kb21FbGVtZW50LmNsaWVudEhlaWdodCk7XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRwYW4oMCwgLSBzY29wZS5rZXlQYW5TcGVlZCk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRuZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBzY29wZS5rZXlzLkxFRlQ6XG5cblx0XHRcdFx0XHRpZiAoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LnNoaWZ0S2V5KSB7XG5cblx0XHRcdFx0XHRcdHJvdGF0ZUxlZnQoMiAqIE1hdGguUEkgKiBzY29wZS5yb3RhdGVTcGVlZCAvIHNjb3BlLmRvbUVsZW1lbnQuY2xpZW50SGVpZ2h0KTtcblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdHBhbihzY29wZS5rZXlQYW5TcGVlZCwgMCk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRuZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBzY29wZS5rZXlzLlJJR0hUOlxuXG5cdFx0XHRcdFx0aWYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSB8fCBldmVudC5zaGlmdEtleSkge1xuXG5cdFx0XHRcdFx0XHRyb3RhdGVMZWZ0KC0gMiAqIE1hdGguUEkgKiBzY29wZS5yb3RhdGVTcGVlZCAvIHNjb3BlLmRvbUVsZW1lbnQuY2xpZW50SGVpZ2h0KTtcblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdHBhbigtIHNjb3BlLmtleVBhblNwZWVkLCAwKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0fVxuXG5cdFx0XHRpZiAobmVlZHNVcGRhdGUpIHtcblxuXHRcdFx0XHQvLyBwcmV2ZW50IHRoZSBicm93c2VyIGZyb20gc2Nyb2xsaW5nIG9uIGN1cnNvciBrZXlzXG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdFx0c2NvcGUudXBkYXRlKCk7XG5cblx0XHRcdH1cblxuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gaGFuZGxlVG91Y2hTdGFydFJvdGF0ZSgpIHtcblxuXHRcdFx0aWYgKHBvaW50ZXJzLmxlbmd0aCA9PT0gMSkge1xuXG5cdFx0XHRcdHJvdGF0ZVN0YXJ0LnNldChwb2ludGVyc1swXS5wYWdlWCwgcG9pbnRlcnNbMF0ucGFnZVkpO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGNvbnN0IHggPSAwLjUgKiAocG9pbnRlcnNbMF0ucGFnZVggKyBwb2ludGVyc1sxXS5wYWdlWCk7XG5cdFx0XHRcdGNvbnN0IHkgPSAwLjUgKiAocG9pbnRlcnNbMF0ucGFnZVkgKyBwb2ludGVyc1sxXS5wYWdlWSk7XG5cblx0XHRcdFx0cm90YXRlU3RhcnQuc2V0KHgsIHkpO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBoYW5kbGVUb3VjaFN0YXJ0UGFuKCkge1xuXG5cdFx0XHRpZiAocG9pbnRlcnMubGVuZ3RoID09PSAxKSB7XG5cblx0XHRcdFx0cGFuU3RhcnQuc2V0KHBvaW50ZXJzWzBdLnBhZ2VYLCBwb2ludGVyc1swXS5wYWdlWSk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0Y29uc3QgeCA9IDAuNSAqIChwb2ludGVyc1swXS5wYWdlWCArIHBvaW50ZXJzWzFdLnBhZ2VYKTtcblx0XHRcdFx0Y29uc3QgeSA9IDAuNSAqIChwb2ludGVyc1swXS5wYWdlWSArIHBvaW50ZXJzWzFdLnBhZ2VZKTtcblxuXHRcdFx0XHRwYW5TdGFydC5zZXQoeCwgeSk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGhhbmRsZVRvdWNoU3RhcnREb2xseSgpIHtcblxuXHRcdFx0Y29uc3QgZHggPSBwb2ludGVyc1swXS5wYWdlWCAtIHBvaW50ZXJzWzFdLnBhZ2VYO1xuXHRcdFx0Y29uc3QgZHkgPSBwb2ludGVyc1swXS5wYWdlWSAtIHBvaW50ZXJzWzFdLnBhZ2VZO1xuXG5cdFx0XHRjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG5cblx0XHRcdGRvbGx5U3RhcnQuc2V0KDAsIGRpc3RhbmNlKTtcblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGhhbmRsZVRvdWNoU3RhcnREb2xseVBhbigpIHtcblxuXHRcdFx0aWYgKHNjb3BlLmVuYWJsZVpvb20pIGhhbmRsZVRvdWNoU3RhcnREb2xseSgpO1xuXG5cdFx0XHRpZiAoc2NvcGUuZW5hYmxlUGFuKSBoYW5kbGVUb3VjaFN0YXJ0UGFuKCk7XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBoYW5kbGVUb3VjaFN0YXJ0RG9sbHlSb3RhdGUoKSB7XG5cblx0XHRcdGlmIChzY29wZS5lbmFibGVab29tKSBoYW5kbGVUb3VjaFN0YXJ0RG9sbHkoKTtcblxuXHRcdFx0aWYgKHNjb3BlLmVuYWJsZVJvdGF0ZSkgaGFuZGxlVG91Y2hTdGFydFJvdGF0ZSgpO1xuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gaGFuZGxlVG91Y2hNb3ZlUm90YXRlKGV2ZW50KSB7XG5cblx0XHRcdGlmIChwb2ludGVycy5sZW5ndGggPT0gMSkge1xuXG5cdFx0XHRcdHJvdGF0ZUVuZC5zZXQoZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRjb25zdCBwb3NpdGlvbiA9IGdldFNlY29uZFBvaW50ZXJQb3NpdGlvbihldmVudCk7XG5cblx0XHRcdFx0Y29uc3QgeCA9IDAuNSAqIChldmVudC5wYWdlWCArIHBvc2l0aW9uLngpO1xuXHRcdFx0XHRjb25zdCB5ID0gMC41ICogKGV2ZW50LnBhZ2VZICsgcG9zaXRpb24ueSk7XG5cblx0XHRcdFx0cm90YXRlRW5kLnNldCh4LCB5KTtcblxuXHRcdFx0fVxuXG5cdFx0XHRyb3RhdGVEZWx0YS5zdWJWZWN0b3JzKHJvdGF0ZUVuZCwgcm90YXRlU3RhcnQpLm11bHRpcGx5U2NhbGFyKHNjb3BlLnJvdGF0ZVNwZWVkKTtcblxuXHRcdFx0Y29uc3QgZWxlbWVudCA9IHNjb3BlLmRvbUVsZW1lbnQ7XG5cblx0XHRcdHJvdGF0ZUxlZnQoMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS54IC8gZWxlbWVudC5jbGllbnRIZWlnaHQpOyAvLyB5ZXMsIGhlaWdodFxuXG5cdFx0XHRyb3RhdGVVcCgyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnkgLyBlbGVtZW50LmNsaWVudEhlaWdodCk7XG5cblx0XHRcdHJvdGF0ZVN0YXJ0LmNvcHkocm90YXRlRW5kKTtcblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGhhbmRsZVRvdWNoTW92ZVBhbihldmVudCkge1xuXG5cdFx0XHRpZiAocG9pbnRlcnMubGVuZ3RoID09PSAxKSB7XG5cblx0XHRcdFx0cGFuRW5kLnNldChldmVudC5wYWdlWCwgZXZlbnQucGFnZVkpO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGNvbnN0IHBvc2l0aW9uID0gZ2V0U2Vjb25kUG9pbnRlclBvc2l0aW9uKGV2ZW50KTtcblxuXHRcdFx0XHRjb25zdCB4ID0gMC41ICogKGV2ZW50LnBhZ2VYICsgcG9zaXRpb24ueCk7XG5cdFx0XHRcdGNvbnN0IHkgPSAwLjUgKiAoZXZlbnQucGFnZVkgKyBwb3NpdGlvbi55KTtcblxuXHRcdFx0XHRwYW5FbmQuc2V0KHgsIHkpO1xuXG5cdFx0XHR9XG5cblx0XHRcdHBhbkRlbHRhLnN1YlZlY3RvcnMocGFuRW5kLCBwYW5TdGFydCkubXVsdGlwbHlTY2FsYXIoc2NvcGUucGFuU3BlZWQpO1xuXG5cdFx0XHRwYW4ocGFuRGVsdGEueCwgcGFuRGVsdGEueSk7XG5cblx0XHRcdHBhblN0YXJ0LmNvcHkocGFuRW5kKTtcblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGhhbmRsZVRvdWNoTW92ZURvbGx5KGV2ZW50KSB7XG5cblx0XHRcdGNvbnN0IHBvc2l0aW9uID0gZ2V0U2Vjb25kUG9pbnRlclBvc2l0aW9uKGV2ZW50KTtcblxuXHRcdFx0Y29uc3QgZHggPSBldmVudC5wYWdlWCAtIHBvc2l0aW9uLng7XG5cdFx0XHRjb25zdCBkeSA9IGV2ZW50LnBhZ2VZIC0gcG9zaXRpb24ueTtcblxuXHRcdFx0Y29uc3QgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuXG5cdFx0XHRkb2xseUVuZC5zZXQoMCwgZGlzdGFuY2UpO1xuXG5cdFx0XHRkb2xseURlbHRhLnNldCgwLCBNYXRoLnBvdyhkb2xseUVuZC55IC8gZG9sbHlTdGFydC55LCBzY29wZS56b29tU3BlZWQpKTtcblxuXHRcdFx0ZG9sbHlPdXQoZG9sbHlEZWx0YS55KTtcblxuXHRcdFx0ZG9sbHlTdGFydC5jb3B5KGRvbGx5RW5kKTtcblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGhhbmRsZVRvdWNoTW92ZURvbGx5UGFuKGV2ZW50KSB7XG5cblx0XHRcdGlmIChzY29wZS5lbmFibGVab29tKSBoYW5kbGVUb3VjaE1vdmVEb2xseShldmVudCk7XG5cblx0XHRcdGlmIChzY29wZS5lbmFibGVQYW4pIGhhbmRsZVRvdWNoTW92ZVBhbihldmVudCk7XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBoYW5kbGVUb3VjaE1vdmVEb2xseVJvdGF0ZShldmVudCkge1xuXG5cdFx0XHRpZiAoc2NvcGUuZW5hYmxlWm9vbSkgaGFuZGxlVG91Y2hNb3ZlRG9sbHkoZXZlbnQpO1xuXG5cdFx0XHRpZiAoc2NvcGUuZW5hYmxlUm90YXRlKSBoYW5kbGVUb3VjaE1vdmVSb3RhdGUoZXZlbnQpO1xuXG5cdFx0fVxuXG5cdFx0Ly9cblx0XHQvLyBldmVudCBoYW5kbGVycyAtIEZTTTogbGlzdGVuIGZvciBldmVudHMgYW5kIHJlc2V0IHN0YXRlXG5cdFx0Ly9cblxuXHRcdGZ1bmN0aW9uIG9uUG9pbnRlckRvd24oZXZlbnQpIHtcblxuXHRcdFx0aWYgKHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlKSByZXR1cm47XG5cblx0XHRcdGlmIChwb2ludGVycy5sZW5ndGggPT09IDApIHtcblxuXHRcdFx0XHRzY29wZS5kb21FbGVtZW50LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZCk7XG5cblx0XHRcdFx0c2NvcGUuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIG9uUG9pbnRlck1vdmUpO1xuXHRcdFx0XHRzY29wZS5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIG9uUG9pbnRlclVwKTtcblxuXHRcdFx0fVxuXG5cdFx0XHQvL1xuXG5cdFx0XHRhZGRQb2ludGVyKGV2ZW50KTtcblxuXHRcdFx0aWYgKGV2ZW50LnBvaW50ZXJUeXBlID09PSAndG91Y2gnKSB7XG5cblx0XHRcdFx0b25Ub3VjaFN0YXJ0KGV2ZW50KTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRvbk1vdXNlRG93bihldmVudCk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIG9uUG9pbnRlck1vdmUoZXZlbnQpIHtcblxuXHRcdFx0aWYgKHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlKSByZXR1cm47XG5cblx0XHRcdGlmIChldmVudC5wb2ludGVyVHlwZSA9PT0gJ3RvdWNoJykge1xuXG5cdFx0XHRcdG9uVG91Y2hNb3ZlKGV2ZW50KTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRvbk1vdXNlTW92ZShldmVudCk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIG9uUG9pbnRlclVwKGV2ZW50KSB7XG5cblx0XHRcdHJlbW92ZVBvaW50ZXIoZXZlbnQpO1xuXG5cdFx0XHRpZiAocG9pbnRlcnMubGVuZ3RoID09PSAwKSB7XG5cblx0XHRcdFx0c2NvcGUuZG9tRWxlbWVudC5yZWxlYXNlUG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKTtcblxuXHRcdFx0XHRzY29wZS5kb21FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgb25Qb2ludGVyTW92ZSk7XG5cdFx0XHRcdHNjb3BlLmRvbUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcnVwJywgb25Qb2ludGVyVXApO1xuXG5cdFx0XHR9XG5cblx0XHRcdHNjb3BlLmRpc3BhdGNoRXZlbnQoX2VuZEV2ZW50KTtcblxuXHRcdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gb25Nb3VzZURvd24oZXZlbnQpIHtcblxuXHRcdFx0bGV0IG1vdXNlQWN0aW9uO1xuXG5cdFx0XHRzd2l0Y2ggKGV2ZW50LmJ1dHRvbikge1xuXG5cdFx0XHRcdGNhc2UgMDpcblxuXHRcdFx0XHRcdG1vdXNlQWN0aW9uID0gc2NvcGUubW91c2VCdXR0b25zLkxFRlQ7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAxOlxuXG5cdFx0XHRcdFx0bW91c2VBY3Rpb24gPSBzY29wZS5tb3VzZUJ1dHRvbnMuTUlERExFO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgMjpcblxuXHRcdFx0XHRcdG1vdXNlQWN0aW9uID0gc2NvcGUubW91c2VCdXR0b25zLlJJR0hUO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGRlZmF1bHQ6XG5cblx0XHRcdFx0XHRtb3VzZUFjdGlvbiA9IC0gMTtcblxuXHRcdFx0fVxuXG5cdFx0XHRzd2l0Y2ggKG1vdXNlQWN0aW9uKSB7XG5cblx0XHRcdFx0Y2FzZSBNT1VTRS5ET0xMWTpcblxuXHRcdFx0XHRcdGlmIChzY29wZS5lbmFibGVab29tID09PSBmYWxzZSkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0aGFuZGxlTW91c2VEb3duRG9sbHkoZXZlbnQpO1xuXG5cdFx0XHRcdFx0c3RhdGUgPSBTVEFURS5ET0xMWTtcblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgTU9VU0UuUk9UQVRFOlxuXG5cdFx0XHRcdFx0aWYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSB8fCBldmVudC5zaGlmdEtleSkge1xuXG5cdFx0XHRcdFx0XHRpZiAoc2NvcGUuZW5hYmxlUGFuID09PSBmYWxzZSkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0XHRoYW5kbGVNb3VzZURvd25QYW4oZXZlbnQpO1xuXG5cdFx0XHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlBBTjtcblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdGlmIChzY29wZS5lbmFibGVSb3RhdGUgPT09IGZhbHNlKSByZXR1cm47XG5cblx0XHRcdFx0XHRcdGhhbmRsZU1vdXNlRG93blJvdGF0ZShldmVudCk7XG5cblx0XHRcdFx0XHRcdHN0YXRlID0gU1RBVEUuUk9UQVRFO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBNT1VTRS5QQU46XG5cblx0XHRcdFx0XHRpZiAoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LnNoaWZ0S2V5KSB7XG5cblx0XHRcdFx0XHRcdGlmIChzY29wZS5lbmFibGVSb3RhdGUgPT09IGZhbHNlKSByZXR1cm47XG5cblx0XHRcdFx0XHRcdGhhbmRsZU1vdXNlRG93blJvdGF0ZShldmVudCk7XG5cblx0XHRcdFx0XHRcdHN0YXRlID0gU1RBVEUuUk9UQVRFO1xuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0aWYgKHNjb3BlLmVuYWJsZVBhbiA9PT0gZmFsc2UpIHJldHVybjtcblxuXHRcdFx0XHRcdFx0aGFuZGxlTW91c2VEb3duUGFuKGV2ZW50KTtcblxuXHRcdFx0XHRcdFx0c3RhdGUgPSBTVEFURS5QQU47XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRkZWZhdWx0OlxuXG5cdFx0XHRcdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmIChzdGF0ZSAhPT0gU1RBVEUuTk9ORSkge1xuXG5cdFx0XHRcdHNjb3BlLmRpc3BhdGNoRXZlbnQoX3N0YXJ0RXZlbnQpO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBvbk1vdXNlTW92ZShldmVudCkge1xuXG5cdFx0XHRzd2l0Y2ggKHN0YXRlKSB7XG5cblx0XHRcdFx0Y2FzZSBTVEFURS5ST1RBVEU6XG5cblx0XHRcdFx0XHRpZiAoc2NvcGUuZW5hYmxlUm90YXRlID09PSBmYWxzZSkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0aGFuZGxlTW91c2VNb3ZlUm90YXRlKGV2ZW50KTtcblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgU1RBVEUuRE9MTFk6XG5cblx0XHRcdFx0XHRpZiAoc2NvcGUuZW5hYmxlWm9vbSA9PT0gZmFsc2UpIHJldHVybjtcblxuXHRcdFx0XHRcdGhhbmRsZU1vdXNlTW92ZURvbGx5KGV2ZW50KTtcblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgU1RBVEUuUEFOOlxuXG5cdFx0XHRcdFx0aWYgKHNjb3BlLmVuYWJsZVBhbiA9PT0gZmFsc2UpIHJldHVybjtcblxuXHRcdFx0XHRcdGhhbmRsZU1vdXNlTW92ZVBhbihldmVudCk7XG5cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gb25Nb3VzZVdoZWVsKGV2ZW50KSB7XG5cblx0XHRcdGlmIChzY29wZS5lbmFibGVkID09PSBmYWxzZSB8fCBzY29wZS5lbmFibGVab29tID09PSBmYWxzZSB8fCBzdGF0ZSAhPT0gU1RBVEUuTk9ORSkgcmV0dXJuO1xuXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRzY29wZS5kaXNwYXRjaEV2ZW50KF9zdGFydEV2ZW50KTtcblxuXHRcdFx0aGFuZGxlTW91c2VXaGVlbChldmVudCk7XG5cblx0XHRcdHNjb3BlLmRpc3BhdGNoRXZlbnQoX2VuZEV2ZW50KTtcblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIG9uS2V5RG93bihldmVudCkge1xuXG5cdFx0XHRpZiAoc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgfHwgc2NvcGUuZW5hYmxlUGFuID09PSBmYWxzZSkgcmV0dXJuO1xuXG5cdFx0XHRoYW5kbGVLZXlEb3duKGV2ZW50KTtcblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIG9uVG91Y2hTdGFydChldmVudCkge1xuXG5cdFx0XHR0cmFja1BvaW50ZXIoZXZlbnQpO1xuXG5cdFx0XHRzd2l0Y2ggKHBvaW50ZXJzLmxlbmd0aCkge1xuXG5cdFx0XHRcdGNhc2UgMTpcblxuXHRcdFx0XHRcdHN3aXRjaCAoc2NvcGUudG91Y2hlcy5PTkUpIHtcblxuXHRcdFx0XHRcdFx0Y2FzZSBUT1VDSC5ST1RBVEU6XG5cblx0XHRcdFx0XHRcdFx0aWYgKHNjb3BlLmVuYWJsZVJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcblxuXHRcdFx0XHRcdFx0XHRoYW5kbGVUb3VjaFN0YXJ0Um90YXRlKCk7XG5cblx0XHRcdFx0XHRcdFx0c3RhdGUgPSBTVEFURS5UT1VDSF9ST1RBVEU7XG5cblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdGNhc2UgVE9VQ0guUEFOOlxuXG5cdFx0XHRcdFx0XHRcdGlmIChzY29wZS5lbmFibGVQYW4gPT09IGZhbHNlKSByZXR1cm47XG5cblx0XHRcdFx0XHRcdFx0aGFuZGxlVG91Y2hTdGFydFBhbigpO1xuXG5cdFx0XHRcdFx0XHRcdHN0YXRlID0gU1RBVEUuVE9VQ0hfUEFOO1xuXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXG5cdFx0XHRcdFx0XHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgMjpcblxuXHRcdFx0XHRcdHN3aXRjaCAoc2NvcGUudG91Y2hlcy5UV08pIHtcblxuXHRcdFx0XHRcdFx0Y2FzZSBUT1VDSC5ET0xMWV9QQU46XG5cblx0XHRcdFx0XHRcdFx0aWYgKHNjb3BlLmVuYWJsZVpvb20gPT09IGZhbHNlICYmIHNjb3BlLmVuYWJsZVBhbiA9PT0gZmFsc2UpIHJldHVybjtcblxuXHRcdFx0XHRcdFx0XHRoYW5kbGVUb3VjaFN0YXJ0RG9sbHlQYW4oKTtcblxuXHRcdFx0XHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlRPVUNIX0RPTExZX1BBTjtcblxuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0Y2FzZSBUT1VDSC5ET0xMWV9ST1RBVEU6XG5cblx0XHRcdFx0XHRcdFx0aWYgKHNjb3BlLmVuYWJsZVpvb20gPT09IGZhbHNlICYmIHNjb3BlLmVuYWJsZVJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcblxuXHRcdFx0XHRcdFx0XHRoYW5kbGVUb3VjaFN0YXJ0RG9sbHlSb3RhdGUoKTtcblxuXHRcdFx0XHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlRPVUNIX0RPTExZX1JPVEFURTtcblxuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblxuXHRcdFx0XHRcdFx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRkZWZhdWx0OlxuXG5cdFx0XHRcdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmIChzdGF0ZSAhPT0gU1RBVEUuTk9ORSkge1xuXG5cdFx0XHRcdHNjb3BlLmRpc3BhdGNoRXZlbnQoX3N0YXJ0RXZlbnQpO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBvblRvdWNoTW92ZShldmVudCkge1xuXG5cdFx0XHR0cmFja1BvaW50ZXIoZXZlbnQpO1xuXG5cdFx0XHRzd2l0Y2ggKHN0YXRlKSB7XG5cblx0XHRcdFx0Y2FzZSBTVEFURS5UT1VDSF9ST1RBVEU6XG5cblx0XHRcdFx0XHRpZiAoc2NvcGUuZW5hYmxlUm90YXRlID09PSBmYWxzZSkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0aGFuZGxlVG91Y2hNb3ZlUm90YXRlKGV2ZW50KTtcblxuXHRcdFx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBTVEFURS5UT1VDSF9QQU46XG5cblx0XHRcdFx0XHRpZiAoc2NvcGUuZW5hYmxlUGFuID09PSBmYWxzZSkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0aGFuZGxlVG91Y2hNb3ZlUGFuKGV2ZW50KTtcblxuXHRcdFx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBTVEFURS5UT1VDSF9ET0xMWV9QQU46XG5cblx0XHRcdFx0XHRpZiAoc2NvcGUuZW5hYmxlWm9vbSA9PT0gZmFsc2UgJiYgc2NvcGUuZW5hYmxlUGFuID09PSBmYWxzZSkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0aGFuZGxlVG91Y2hNb3ZlRG9sbHlQYW4oZXZlbnQpO1xuXG5cdFx0XHRcdFx0c2NvcGUudXBkYXRlKCk7XG5cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFNUQVRFLlRPVUNIX0RPTExZX1JPVEFURTpcblxuXHRcdFx0XHRcdGlmIChzY29wZS5lbmFibGVab29tID09PSBmYWxzZSAmJiBzY29wZS5lbmFibGVSb3RhdGUgPT09IGZhbHNlKSByZXR1cm47XG5cblx0XHRcdFx0XHRoYW5kbGVUb3VjaE1vdmVEb2xseVJvdGF0ZShldmVudCk7XG5cblx0XHRcdFx0XHRzY29wZS51cGRhdGUoKTtcblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGRlZmF1bHQ6XG5cblx0XHRcdFx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIG9uQ29udGV4dE1lbnUoZXZlbnQpIHtcblxuXHRcdFx0aWYgKHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlKSByZXR1cm47XG5cblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBhZGRQb2ludGVyKGV2ZW50KSB7XG5cblx0XHRcdHBvaW50ZXJzLnB1c2goZXZlbnQpO1xuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlUG9pbnRlcihldmVudCkge1xuXG5cdFx0XHRkZWxldGUgcG9pbnRlclBvc2l0aW9uc1tldmVudC5wb2ludGVySWRdO1xuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHBvaW50ZXJzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdFx0aWYgKHBvaW50ZXJzW2ldLnBvaW50ZXJJZCA9PSBldmVudC5wb2ludGVySWQpIHtcblxuXHRcdFx0XHRcdHBvaW50ZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmFja1BvaW50ZXIoZXZlbnQpIHtcblxuXHRcdFx0bGV0IHBvc2l0aW9uID0gcG9pbnRlclBvc2l0aW9uc1tldmVudC5wb2ludGVySWRdO1xuXG5cdFx0XHRpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuXG5cdFx0XHRcdHBvc2l0aW9uID0gbmV3IFZlY3RvcjIoKTtcblx0XHRcdFx0cG9pbnRlclBvc2l0aW9uc1tldmVudC5wb2ludGVySWRdID0gcG9zaXRpb247XG5cblx0XHRcdH1cblxuXHRcdFx0cG9zaXRpb24uc2V0KGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSk7XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBnZXRTZWNvbmRQb2ludGVyUG9zaXRpb24oZXZlbnQpIHtcblxuXHRcdFx0Y29uc3QgcG9pbnRlciA9IChldmVudC5wb2ludGVySWQgPT09IHBvaW50ZXJzWzBdLnBvaW50ZXJJZCkgPyBwb2ludGVyc1sxXSA6IHBvaW50ZXJzWzBdO1xuXG5cdFx0XHRyZXR1cm4gcG9pbnRlclBvc2l0aW9uc1twb2ludGVyLnBvaW50ZXJJZF07XG5cblx0XHR9XG5cblx0XHQvL1xuXG5cdFx0c2NvcGUuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIG9uQ29udGV4dE1lbnUpO1xuXG5cdFx0c2NvcGUuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIG9uUG9pbnRlckRvd24pO1xuXHRcdHNjb3BlLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmNhbmNlbCcsIG9uUG9pbnRlclVwKTtcblx0XHRzY29wZS5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25Nb3VzZVdoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuXG5cdFx0Ly8gZm9yY2UgYW4gdXBkYXRlIGF0IHN0YXJ0XG5cblx0XHR0aGlzLnVwZGF0ZSgpO1xuXG5cdH1cblxufVxuXG5leHBvcnQgeyBPcmJpdENvbnRyb2xzIH07XG4iXSwibmFtZXMiOlsiTWF0aFV0aWxzLmNsYW1wIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sZUFBZSxDQUFDO0FBQ3RCO0FBQ0EsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsUUFBUSxHQUFHO0FBQ3BDO0FBQ0EsRUFBRSxLQUFLLElBQUksQ0FB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QUNIO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FDMURBLFNBQVMsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHO0FBQ2xDO0FBQ0EsQ0FBQyxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7QUFDaEQ7QUFDQTs7QUMzQkEsTUFBTSxVQUFVLENBQUM7QUFDakI7QUFDQSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHO0FBQzNDO0FBQ0EsRUFBRSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztBQUMzQjtBQUNBLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDZCxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNkLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxTQUFTLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxHQUFHO0FBQzNFO0FBQ0E7QUFDQTtBQUNBLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUU7QUFDakMsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUU7QUFDOUIsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUU7QUFDOUIsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMvQjtBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUU7QUFDbkMsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUU7QUFDOUIsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUU7QUFDOUIsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMvQjtBQUNBLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO0FBQ2pCO0FBQ0EsR0FBRyxHQUFHLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM3QixHQUFHLEdBQUcsRUFBRSxTQUFTLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzdCLEdBQUcsR0FBRyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDN0IsR0FBRyxHQUFHLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM3QixHQUFHLE9BQU87QUFDVjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO0FBQ2pCO0FBQ0EsR0FBRyxHQUFHLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM3QixHQUFHLEdBQUcsRUFBRSxTQUFTLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzdCLEdBQUcsR0FBRyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDN0IsR0FBRyxHQUFHLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM3QixHQUFHLE9BQU87QUFDVjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHO0FBQzFEO0FBQ0EsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLEdBQUcsTUFBTSxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDcEQsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUU7QUFDaEMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDM0I7QUFDQTtBQUNBLEdBQUcsS0FBSyxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNsQztBQUNBLElBQUksTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7QUFDbkMsS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ3hDO0FBQ0EsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO0FBQ2xDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUNsQztBQUNBLElBQUk7QUFDSjtBQUNBLEdBQUcsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN4QjtBQUNBLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztBQUMzQixHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDM0IsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQzNCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztBQUMzQjtBQUNBO0FBQ0EsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHO0FBQ3RCO0FBQ0EsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDckU7QUFDQSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWixJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWixJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWixJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWjtBQUNBLElBQUk7QUFDSjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUN4QixFQUFFLEdBQUcsRUFBRSxTQUFTLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzVCLEVBQUUsR0FBRyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDNUIsRUFBRSxHQUFHLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM1QjtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyx1QkFBdUIsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsR0FBRztBQUN0RjtBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDO0FBQ2hDLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNwQyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksRUFBRSxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDcEMsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLEVBQUUsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ3BDO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDaEMsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLEVBQUUsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ3BDLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNwQyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksRUFBRSxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDcEM7QUFDQSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzNELEVBQUUsR0FBRyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQy9ELEVBQUUsR0FBRyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQy9ELEVBQUUsR0FBRyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQy9EO0FBQ0EsRUFBRSxPQUFPLEdBQUcsQ0FBQztBQUNiO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxJQUFJLENBQUMsR0FBRztBQUNUO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFLENB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LENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDdkIsRUFBRSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3ZCO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQzFCLEVBQUUsTUFBTSxFQUFFLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMxQixFQUFFLE1BQU0sRUFBRSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDMUI7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDMUIsRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQzFCLEVBQUUsTUFBTSxFQUFFLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMxQjtBQUNBLEVBQUUsU0FBUyxLQUFLO0FBQ2hCO0FBQ0EsR0FBRyxLQUFLLEtBQUs7QUFDYixJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxNQUFNO0FBQ1Y7QUFDQSxHQUFHLEtBQUssS0FBSztBQUNiLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLE1BQU07QUFDVjtBQUNBLEdBQUcsS0FBSyxLQUFLO0FBQ2IsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksTUFBTTtBQUNWO0FBQ0EsR0FBRyxLQUFLLEtBQUs7QUFDYixJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxNQUFNO0FBQ1Y7QUFDQSxHQUFHLEtBQUssS0FBSztBQUNiLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLE1BQU07QUFDVjtBQUNBLEdBQUcsS0FBSyxLQUFLO0FBQ2IsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFDLElBQUksTUFBTTtBQUNWO0FBQ0EsR0FBRztBQUNILElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxrRUFBa0UsR0FBRyxLQUFLLEVBQUUsQ0FBQztBQUMvRjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsS0FBSyxNQUFNLEtBQUssS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQ25EO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsS0FBSyxHQUFHO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLE1BQU0sU0FBUyxHQUFHLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDekQ7QUFDQSxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QixFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNsQztBQUNBLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDM0I7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLHFCQUFxQixFQUFFLENBQUMsR0FBRztBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUTtBQUN2QjtBQUNBLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzlDLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzlDLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFO0FBQy9DO0FBQ0EsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDM0I7QUFDQSxFQUFFLEtBQUssS0FBSyxHQUFHLENBQUMsR0FBRztBQUNuQjtBQUNBLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQzVDO0FBQ0EsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7QUFDdEIsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0I7QUFDQSxHQUFHLE1BQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdkM7QUFDQSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ3REO0FBQ0EsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7QUFDdEIsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDL0I7QUFDQSxHQUFHLE1BQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQzFCO0FBQ0EsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUN0RDtBQUNBLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQy9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQy9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FB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LEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3ZELEVBQUUsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN2RDtBQUNBLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzFELEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzFELEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzFELEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzFEO0FBQ0EsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUMzQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUc7QUFDaEI7QUFDQSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLElBQUksQ0FBQztBQUM3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RUFBRSxDQUFDO0FBQ3RDLEVBQUUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUNqQztBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pDO0FBQ0EsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLEdBQUc7QUFDakIsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDM0IsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDMUIsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDMUIsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDM0IsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE1BQU0sRUFBRSxVQUFVLEdBQUc7QUFDdEI7QUFDQSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFLFFBQVEsVUFBVSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sVUFBVSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sVUFBVSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDMUk7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLENBQUMsR0FBRztBQUNoQztBQUNBLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDNUIsRUFBRSxJQUFJLENB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LElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3ZFO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxNQUFNLEdBQUc7QUFDVjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDcEIsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNwQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRztBQUNWO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckM7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUc7QUFDWjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JDO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxRQUFRLEdBQUc7QUFDWjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNDO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxNQUFNLEdBQUc7QUFDVjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FB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QUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUM7QUFDckM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssR0FBRztBQUM5QjtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQztBQUMxQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUM7QUFDMUM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUc7QUFDYjtBQUNBLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRztBQUN0RDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxHQUFHO0FBQ2hDO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUMzQixFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMvQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsTUFBTSxHQUFHLENBQUMsR0FBRztBQUNuQztBQUNBLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLElB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RSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEI7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUc7QUFDaEI7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2QsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNkLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDekI7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEIsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRztBQUNWO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEI7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUc7QUFDaEI7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2QsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNkLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRztBQUNmO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsRUFBRSxJQUFJLENBQUMsQ0FB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QUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUN2QjtBQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3BFO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNsRSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2xFLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDbkU7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUc7QUFDdEI7QUFDQSxFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDM0MsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdEMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN0QyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN4QztBQUNBO0FBQ0E7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUN2RCxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUN2RCxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxH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O0FBQ2hDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNoQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDaEM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLElBQUksR0FBRztBQUNSO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQy9CLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMvQixFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDL0I7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEtBQUssR0FBRztBQUNUO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2hDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNoQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDaEM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFdBQVcsR0FBRztBQUNmO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDdkUsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDdkUsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDdkU7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE1BQU0sR0FBRztBQUNWO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNwQixFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDcEI7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUc7QUFDVjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRDtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQSxDQUFDLFFBQVEsR0FBRztBQUNaO0FBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzdEO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxNQUFNLEdBQUc7QUFDVjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDMUU7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLGVBQWUsR0FBRztBQUNuQjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN0RTtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsU0FBUyxHQUFHO0FBQ2I7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDakQ7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFNBQVMsRUFBRSxNQUFNLEdBQUc7QUFDckI7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNuRDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUc7QUFDbEI7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDO0FBQ3JDLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUM7QUFDckMsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQztBQUNyQztBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZDtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxHQUFHO0FBQzlCO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDO0FBQzFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQztBQUMxQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUM7QUFDMUM7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2Q7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUc7QUFDWjtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN0QztBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDdEI7QUFDQSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxD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LENBQUMsQ0FBQztBQUM1RDtBQUNBLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUI7QUFDQSxJQUFJO0FBQ0o7QUFDQSxHQUFHO0FBQ0g7QUFDQSxFQUFFLFNBQVMsbUJBQW1CLEdBQUc7QUFDakM7QUFDQSxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDOUI7QUFDQSxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkQ7QUFDQSxJQUFJLE1BQU07QUFDVjtBQUNBLElBQUksTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVELElBQUksTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVEO0FBQ0EsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QjtBQUNBLElBQUk7QUFDSjtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsU0FBUyxxQkFBcUIsR0FBRztBQUNuQztBQUNBLEdBQUcsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3BELEdBQUcsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3BEO0FBQ0EsR0FBRyxNQUFNLFFBQVEsR0FBRyxJQUFJ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
