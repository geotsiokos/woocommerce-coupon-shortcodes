<?php
/**
 * class-woocommerce-coupon-shortcodes-blocks.php
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
 * @package woocommerce-coupon-shortcodes
 * @since woocommerce-coupon-shortcodes 1.21.0
 */

if ( !defined( 'ABSPATH' ) ) {
	exit;
}

//require_once WOO_CODES_VIEWS_LIB . '/class-woocommerce-coupon-shortcodes-views.php';

class WooCommerce_Coupon_Shortcodes_Blocks {

	public static function init() {
		add_action( 'init', array( __CLASS__, 'woocommerce_coupon_shortcodes_blocks_init' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'woocommerce_coupon_shortcodes_rest' ) );
		if ( function_exists( 'get_default_block_categories' ) ) {
			add_filter( 'block_categories_all', array( __CLASS__, 'block_categories_all' ), 10, 2 );
		} else {
			add_filter( 'block_categories', array( __CLASS__, 'woocommerce_coupon_shortcodes_block_categories' ), 10, 2 );
		}
	}

	public static function woocommerce_coupon_shortcodes_rest() {
		register_rest_route(
			'woocommerce-coupon-shortcodes/blocks',
			'/woocommerce-coupon-shortcodes',
			array(
				// Get the list of existing coupon codes.
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'woocommerce_coupon_shortcodes_get_coupons' ),
					// Restrict access for the endpoint only to users that can administrate groups restrictions.
					'permission_callback' => function() {
						return current_user_can( 'edit_posts' );
					},
				),
			),
		);
	}

	public static function woocommerce_coupon_shortcodes_access_permission() {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return new WP_Error(
				'rest_forbidden',
				esc_html__( 'Access denied', WOO_CODES_PLUGIN_DOMAIN ),
				array( 'status' => 401 )
			);
		}

		return true;
	}

	public static function woocommerce_coupon_shortcodes_blocks_init() {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}
		$asset_file = include WOO_CODES_BLOCKS_LIB . '/build/index.asset.php';

		$editor_dependencies = array_merge(
			$asset_file['dependencies'],
			array()
		);

		wp_register_script(
			'woo-codes-blocks-block-js', // Handle.
			WOO_CODES_PLUGIN_URL . '/lib/blocks/build/index.js',
			$editor_dependencies,
			WOO_CODES_PLUGIN_VERSION
		);

		wp_register_style(
			'woo-codes-blocks-block-editor-css', // Handle.
			WOO_CODES_PLUGIN_URL . '/lib/blocks/build/index.css',
			array( 'wp-edit-blocks' ), // Dependency to include the CSS after it.
			WOO_CODES_PLUGIN_VERSION
		);

		register_block_type(
			'woocommerce-coupon-shortcodes/coupon-is-active',
			array(
				'editor_script'   => 'woo-codes-blocks-block-js',
				'editor_style'    => 'woo-codes-blocks-block-editor-css',
				'style'           => 'woo-codes-blocks-style-css',
				'render_callback' => array( __CLASS__, 'coupon_is_active_render_content' ),
			)
		);

		register_block_type(
			'woocommerce-coupon-shortcodes/coupon-code',
			array(
				'editor_script'   => 'woo-codes-blocks-block-js',
				'editor_style'    => 'woo-codes-blocks-block-editor-css',
				'style'           => 'woo-codes-blocks-style-css',
				'render_callback' => array( __CLASS__, 'coupon_code_render_content' ),
			)
		);
	}

	public static function block_categories_all( $block_categories, $block_editor_context ) {
		$block_categories = array_merge(
			$block_categories,
			array(
				array(
					'slug'  => 'woocommerce-coupon-shortcodes',
					'title' => 'WooCommerce Coupon Shortcodes'
				)
			)
		);
		return $block_categories;
	}

	public static function woocommerce_coupon_shortcodes_block_categories( $categories, $post ) {
		$categories = array_merge(
			$categories,
			array(
				array(
					'slug'  => 'woocommerce-coupon-shortcodes',
					'title' => 'WooCommerce Coupon Shortcodes'
				),
			)
		);
		return $categories;
	}

	public static function coupon_is_active_render_content( $attributes, $content ) {
		$output = '';
		$active = false;
		require_once WOO_CODES_VIEWS_LIB . '/class-woocommerce-coupon-shortcodes-views.php';
		if ( isset( $attributes['active_coupons'] ) && $attributes['active_coupons'] ) {
			$coupon_codes = self::woocommerce_coupon_shortcodes_get_coupons();
			$active = true;
		} else {
			if ( isset( $attributes['coupon_codes_select'] ) ) {
				$decoded_coupon_codes = json_decode( $attributes['coupon_codes_select'] );
				$coupon_codes = array();
				foreach ( $decoded_coupon_codes as $code ) {
					$coupon_codes[] = $code->value;
				}
			}
		}

		if ( count( $coupon_codes ) > 0 ) {
			$wcs_discounts = new WooCommerce_Coupon_Shortcodes_WC_Discounts();
			$actives = array();
			foreach ( $coupon_codes as $code ) {
				$coupon = new WC_Coupon( $code );
				$actives[] =
					$wcs_discounts->_wcs_coupon_exists( $coupon ) &&
					!$wcs_discounts->_wcs_coupon_is_expired( $coupon ) &&
					$wcs_discounts->_wcs_coupon_is_useable( $coupon );
			}
			$decoded_operator = 'and';
			if ( isset( $attributes['operator_select'] ) ) {
				$decoded_operator = json_decode( $attributes['operator_select'] );
			}
			switch( strtolower( $decoded_operator ) ) {
				case 'or' :
					$active = WooCommerce_Coupon_Shortcodes_Views::disj( $actives );
					break;
				default :
					$active = WooCommerce_Coupon_Shortcodes_Views::conj( $actives );
			}
		}

		if ( $active ) {
			$output .='<div class="woo-coupon-codes-coupon-is-active-block-content">' . $content . '</div>';
		}

		return $output;
	}

	public static function coupon_code_render_content( $attributes, $content ) {
		$output = '';
		// this is the default separator
		$decoded_separator = ' ';
		if ( isset( $attributes['code_separator'] ) ) {
			$decoded_separator = json_decode( $attributes['code_separator'] );
		}

		if ( isset( $attributes['coupon_codes_select'] ) ) {
			$output = '<div class="wp-block-woocommerce-coupon-shortcodes-coupon-code"><p>';

			$decoded_coupon_codes = json_decode( $attributes['coupon_codes_select'] );
			error_log( print_r( $decoded_coupon_codes[0]->value, true ) );
			$coupon_amount = count( $decoded_coupon_codes );
			for ( $i = 0; $i < $coupon_amount; $i++ ) {
				$output .= sprintf( '<span class="coupon code %s">', esc_attr( $decoded_coupon_codes[$i]->value ) );
				$output .= esc_html( $decoded_coupon_codes[$i]->value );
				$output .= '</span>';
				if ( ( $coupon_amount - $i ) > 1  ) {
					$output .= esc_html( $decoded_separator );
				}
			}

			$output .= '</p></div>';
			$content = '<div class="woo-coupon-codes-coupon-code-block-content">' . $output . '</div>';
		}

		return $content;
	}

	public static function woocommerce_coupon_shortcodes_get_coupons() {
		
		//$args = array(
		//	'posts_per_page'   => -1,
		//	'orderby'          => 'title',
		//	'order'            => 'asc',
		//	'post_type'        => 'shop_coupon',
		//	'post_status'      => 'publish',
		//);
		//$coupons = get_posts( $args );
		// Get coupon titles aka codes
		$coupon_codes = array();
		$all_coupons = self::get_coupons();
		foreach ( $all_coupons as $coupon ) {
			// Get the name for each coupon post
			$coupon_codes[] = array(
				'value' => $coupon->post_title,
				'label' => $coupon->post_title
			);
		}

		return $coupon_codes;
	}

	private static function get_coupons() {
		$args = array(
			'posts_per_page'   => -1,
			'orderby'          => 'title',
			'order'            => 'asc',
			'post_type'        => 'shop_coupon',
			'post_status'      => 'publish',
		);
		return get_posts( $args );
	}

} WooCommerce_Coupon_Shortcodes_Blocks::init();