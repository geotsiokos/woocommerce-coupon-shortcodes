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
import { registerBlockType } from '@wordpress/blocks';
import { PanelBody, PanelRow, Spinner } from '@wordpress/components';

registerBlockType(
	'woocommerce-coupon-shortcodes/coupon-is-active',
	{
		title: __( 'Coupon is Active Block', 'woocommerce-coupon-shortcodes' ), // Block title.
		description: __( 'Show content for active coupon(s)', 'woocommerce-coupon-shortcodes' ),
		icon: 'smiley', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
		category: 'woocommerce-coupon-shortcodes', // Block category
		//keywords: [ __( 'keyword', 'woocommerce-coupon-shortcodes' ) ],
		edit() {
			return (
				<div >While in the back-end.</div>
			);
		},
		/*edit: withSelect(
			( select ) => {
				return {
					// Uses select() to return an object of the store's selectors. Pre-bound to pass the current state automatically.
					groups: select( 'groups/groups-blocks' ).receiveGroups(),
				};
			}
		)

		(
			props => {

				/*const
				{
					attributes: { groups_select },
					groups,
					className,
					setAttributes,
					isSelected
				} = props;*/

				//const handleGroupsChange = ( groups_select ) => setAttributes(
				//	{ groups_select: JSON.stringify( groups_select ) }
				//);

				//let selectedGroups = [];

				//if ( null !== groups_select ) {
				//	selectedGroups = JSON.parse( groups_select );
				//}

				// Show if the data is not loaded yet.
				//if ( !groups.length ) {
				//	return (
				//		<p className={ className}>
				//		<Spinner/>
				//		{ __( 'Loading...', 'groups' ) }
				//		</p>
				//	);
				//}
				/*
				return [
					<InspectorControls>
						<PanelBody title={ __( 'Select Groups', 'groups' ) } className="block-inspector">
							<PanelRow>
								<label htmlFor="block-groups" className="groups-inspector__label">
									{ __( 'Content will be shown for coupons that are active:', 'groups' ) }
								</label>
							</PanelRow>
							
						</PanelBody>
					</InspectorControls>,
					<div className = { isSelected ? ( classnames( className ) + '__selected' ) : props.className }>
						<div className = { classnames( className ) + '__inner-block' }>
							<InnerBlocks/>
						</div>
					</div>
				];
			}
		),*/
	}
);