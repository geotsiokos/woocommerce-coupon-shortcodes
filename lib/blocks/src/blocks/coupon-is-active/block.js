/**
 * coupon-is-active/block.js
 *
 * Copyright (c) "kento" Karim Rahimpur www.itthinx.com
 *
 * This code is released under the GNU General Public License.
 * See COPYRIGHT.txt and LICENSE.txt.
 *
 * This code is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * This header and all notices must be kept intact.
 *
 * @author George Tsiokos
 * @author itthinx
 * @package woocommerce-coupon-shortcodes
 * @since woocommerce-coupon-shortcodes 1.21.0
 */

import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import Select from 'react-select';
import { RadioControl } from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';
import { PanelBody, PanelRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { createReduxStore, register, withSelect, useSelect } from '@wordpress/data';
//import { TextControl } from '@wordpress/components';
import { InspectorControls, InnerBlocks } from '@wordpress/block-editor';

const DEFAULT_STATE = {
	coupon_codes: {},
	coupon_codes_operator: 'and'
};

const actions = {
	// Action creator
	setCouponCodes( coupon_codes )
	{
		return {
			type: 'SET_COUPON_CODES',
			coupon_codes,
		};
	},

	getCouponCodes( path )
	{
		return {
			type: 'GET_COUPON_CODES',
			path,
		};
	},
	fetchFromAPI( path ) {
		return {
			type: 'FETCH_FROM_API',
			path,
		};
	}
};

const store = createReduxStore(
	'woocommerce-coupon-shortcodes/woocommerce-coupon-shortcodes-blocks', {
	reducer( state = DEFAULT_STATE, action ) {
		switch ( action.type ) {
			case 'SET_COUPON_CODES':
				return {
					...state,
					coupon_codes: action.coupon_codes,
				};

			
		}

		return state;
	},

	actions,

	selectors: {
		getCouponCodes( state ) {
			const {
				coupon_codes
			} = state;
			return coupon_codes;
		},
	},

	controls: {
		FETCH_FROM_API( action ) {
			return apiFetch( { path: action.path } );
		},
	},

	resolvers: {
		* getCouponCodes( state ) {
			const path = '/woocommerce-coupon-shortcodes/blocks/woocommerce-coupon-shortcodes/';
			const coupon_codes = yield actions.fetchFromAPI( path );
			return actions.setCouponCodes( coupon_codes );
		},
	},
} );
register( store );

registerBlockType(
	'woocommerce-coupon-shortcodes/coupon-is-active',
	{
		title: __( 'Coupon is Active', 'woocommerce-coupon-shortcodes' ), // Block title.
		description: __( 'Show content for active coupon(s). A coupon is considered active while it has not expired and its usage limits have not been exhausted.', 'woocommerce-coupon-shortcodes' ),
		icon: 'smiley', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
		category: 'woocommerce-coupon-shortcodes', // Block category
		//keywords: [ __( 'keyword', 'woocommerce-coupon-shortcodes' ) ],
		attributes:
		{
			coupon_codes_select:
			{
				type: 'string',
				default: null
			},
			coupon_codes_operator_select:
			{
				type: 'string',
				default: null
			}
		},
		
		edit: withSelect(
			( select ) => {
				return {
					// the store name to be used with the selector
					codes: select( 'woocommerce-coupon-shortcodes/woocommerce-coupon-shortcodes-blocks' ).getCouponCodes(),
				};
			}
		)

		(
			props => {
				const
				{
					attributes: { coupon_codes_select },
					attributes: { coupon_codes_operator_select },
					codes,
					className,
					setAttributes,
					isSelected
				} = props;

				const coupon_codes_operator = [
					{ value: 'and', label: 'AND' },
					{ value: 'or', label: 'OR' },
				];

				const handleCouponsCodesChange = ( coupon_codes_select ) => setAttributes(
					{ coupon_codes_select: JSON.stringify( coupon_codes_select ) }
				);

				let selectedCouponCodes = [];
				if ( null !== coupon_codes_select ) {
					selectedCouponCodes = JSON.parse( coupon_codes_select );
				}

				//let selectedCouponCodeOperator = [];
				//if ( null !== coupon_codes_operator_select ) {
				//	selectedCouponCodeOperator = '';
				//}

				return [
					<InspectorControls>
						<PanelBody title={ __( 'Block Attributes', 'woocommerce-coupon-shortcodes' ) } className="block-inspector">
							<PanelRow>
								<label htmlFor="block-woo-coupon-codes" className="woo-coupon-codes-inspector__label">
									{ __( 'Content will be shown for the coupons selected:', 'woocommerce-coupon-shortcodes' ) }
								</label>
							</PanelRow>
							<PanelRow>
								<Select
									className = "woo-coupon-codes-inspector__control"
									name      = 'block-woo-coupon-codes'
									value     = { selectedCouponCodes }
									onChange  = { handleCouponsCodesChange }
									options   = { codes }
									isClearable
									isMulti   = 'true'
								/>
							</PanelRow>
							<PanelRow>
								<label htmlFor="block-woo-coupon-codes-operator"className="woo-coupon-codes-inspector__label">
									{ __( 'The operation applied to evaluate the coupons', 'woocommerce-coupon-shortcodes' ) }
								</label>
							</PanelRow>
							<PanelRow>
								<RadioControl
									label={ __( 'Operation type','woocommerce-coupon-shortcodes' ) }
									help={ __( 'The operation applied to evaluate the coupons', 'woocommerce-coupon-shortcodes' ) }
									selected={ coupon_codes_operator[0] }
									options={ coupon_codes_operator }
								/>
								
								
								
							</PanelRow>
						</PanelBody>
					</InspectorControls>,
					
					<div className = { isSelected ? ( classnames( className ) + '__selected' ) : props.className }>
						<div className = { classnames( className ) + '__inner-block' }>
							<InnerBlocks/>
						</div>
					</div>
					
				];
			},
		),

		save: props => {
			return (
				<div>
					<InnerBlocks.Content/>
				</div>
			);
		},

		
	}
);