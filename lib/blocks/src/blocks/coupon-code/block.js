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
import { SelectControl, TextControl } from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';
import { PanelBody, PanelRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { createReduxStore, register, withSelect } from '@wordpress/data';
import { InspectorControls, InnerBlocks } from '@wordpress/block-editor';

import './editor.css';

const DEFAULT_STATE = {
	coupon_codes: {},
	code_separator: {}
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
	setCodeSeparator( code_separator )
	{
		return {
			type: 'SET_CODE_SEPARATOR',
			code_separator,
		};
	},

	getCouponCodes( path )
	{
		return {
			type: 'GET_COUPON_CODES',
			path,
		};
	},
	getCodeSeparator( path )
	{
		return {
			type: 'GET_CODE_SEPARATOR',
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
			case 'SET_CODE_SEPARATOR':
				return {
					...state,
					code_separator: action.code_separator,
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
		getCodeSeparator( state ) {
			const {
				code_separator
			} = state;
			return code_separator;
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
	'woocommerce-coupon-shortcodes/coupon-code',
	{
		title: __( 'Coupon Code', 'woocommerce-coupon-shortcodes' ), // Block title.
		description: __( 'Show the code for selected coupon(s).', 'woocommerce-coupon-shortcodes' ),
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
			code_separator:
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
					attributes: { code_separator },
					codes,
					className,
					setAttributes,
					isSelected
				} = props;

				const handleCouponsCodesChange = ( coupon_codes_select ) => setAttributes(
					{ coupon_codes_select: JSON.stringify( coupon_codes_select ) }
				);

				const handleCodeSeparatorChange = ( code_separator ) => setAttributes(
					{ code_separator: JSON.stringify( code_separator ) }
				);

				let selectedCouponCodes = [];
				if ( null !== coupon_codes_select ) {
					selectedCouponCodes = JSON.parse( coupon_codes_select );
				}

				let insertedCodeSeparator = [];
				if ( null !== code_separator ) {
					insertedCodeSeparator = JSON.parse( code_separator );
				}

				return [
					<InspectorControls>
						<PanelBody title={ __( 'Block Attributes', 'woocommerce-coupon-shortcodes' ) } className="block-inspector">
							<PanelRow>
								<label htmlFor="block-woo-coupon-codes-all" className="woo-coupon-codes-inspector__label">
									{ __( 'Code will be shown for the selected coupons', 'woocommerce-coupon-shortcodes' ) }
								</label>
							</PanelRow>
							{/*<PanelRow>
								<ToggleControl
									//label="All active coupons"
									help={
										activeCoupons
										? __( 'All active coupons', 'woocommerce-coupon-shortcodes' )
										: __( 'Coupons selected from the list.', 'woocommerce-coupon-shortcodes' )
									}
									checked={ activeCoupons }
									onChange={ handleActiveCouponsOption }
								/>
							</PanelRow>*/}
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
							{/*<PanelRow>
								<label htmlFor="block-woo-coupon-codes-operator"className="woo-coupon-codes-inspector__label">
									{ __( 'The operator applied to evaluate the coupons', 'woocommerce-coupon-shortcodes' ) }
								</label>
							</PanelRow>*/}
							<PanelRow>
								<TextControl
									label="Insert coupon code separator, defaults to ' '(blankspace)"
									value={ insertedCodeSeparator }
									onChange={ handleCodeSeparatorChange }
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