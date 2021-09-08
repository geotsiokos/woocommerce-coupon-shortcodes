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

class WooCommerce_Coupon_Shortcodes_Blocks {

	public static function init() {
		// @todo check why it won't show the block if we use the default hook priority aka 10
		add_action( 'init', array( __CLASS__, 'woocommerce_coupon_shortcodes_blocks_init' ), 11 );
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

	public static function woocommerce_coupon_shortcodes_get_coupons() {
		$coupon_codes = array();
		$args = array(
			'posts_per_page'   => -1,
			'orderby'          => 'title',
			'order'            => 'asc',
			'post_type'        => 'shop_coupon',
			'post_status'      => 'publish',
		);

		$coupons = get_posts( $args );
		// Get coupon titles aka codes
		$coupon_codes[] = array(
				'value' => '*',
				'label' => esc_html__( 'All active coupons', WOO_CODES_PLUGIN_DOMAIN )
		);
		foreach ( $coupons as $coupon ) {
			// Get the name for each coupon post
			$coupon_codes[] = array(
				'value' => $coupon->post_title,
				'label' => $coupon->post_title
			);
		}
		error_log( print_r( $coupon_codes, true ) );
		return $coupon_codes;
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
			'woo_codes_blocks-block-editor-css', // Handle.
			WOO_CODES_PLUGIN_URL . 'lib/blocks/build/index.css',
			array( 'wp-edit-blocks' ), // Dependency to include the CSS after it.
			WOO_CODES_PLUGIN_VERSION
		);

		register_block_type(
			'woocommerce-coupon-shortcodes/coupon-is-active',
			array(
				'editor_script'   => 'woo-codes-blocks-block-js',
				'editor_style'    => 'woo-codes-blocks-block-editor-css',
				'style'           => 'woo-codes_blocks-style-css',
				'render_callback' => array( __CLASS__, 'coupon_is_active_render_content' ),
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
		return '<div class="woo-coupon-codes-coupon-is-active-block-content">' . $content . '</div>';
	}

} WooCommerce_Coupon_Shortcodes_Blocks::init();