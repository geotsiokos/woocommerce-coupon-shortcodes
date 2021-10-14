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
import { SelectControl } from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';
import { PanelBody, PanelRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { createReduxStore, register, withSelect } from '@wordpress/data';
import { InspectorControls, InnerBlocks } from '@wordpress/block-editor';

import './editor.css';

const DEFAULT_STATE = {
	coupon_codes: {},
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
					codes,
					className,
					setAttributes,
					isSelected
				} = props;

				const handleCouponsCodesChange = ( coupon_codes_select ) => setAttributes(
					{ coupon_codes_select: JSON.stringify( coupon_codes_select ) }
				);

				let selectedCouponCodes = [];
				if ( null !== coupon_codes_select ) {
					selectedCouponCodes = JSON.parse( coupon_codes_select );
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
									//isDisabled= { activeCoupons ? true : false }
								/>
							</PanelRow>
							{/*<PanelRow>
								<label htmlFor="block-woo-coupon-codes-operator"className="woo-coupon-codes-inspector__label">
									{ __( 'The operator applied to evaluate the coupons', 'woocommerce-coupon-shortcodes' ) }
								</label>
							</PanelRow>*/}
							{/*<PanelRow>
								<RadioControl
									label= { __( 'Operation type','woocommerce-coupon-shortcodes' ) }
									help={
										selectedOperator === 'and'
											? __(
												'All the selected Coupons must be active.',
												'woocommerce-coupon-shortcodes'
											)
											: __(
												'Any of the selected Coupons must be active.',
												'woocommerce-coupon-shortcodes'
											)
									}
									onChange={ handleOperatorChange }
									options= { operator_options }
									selected= { selectedOperator !== null ? selectedOperator : 'and' }
								/>
							</PanelRow>*/}
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