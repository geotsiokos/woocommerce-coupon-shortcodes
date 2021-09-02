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
		add_action( 'init', array( __CLASS__, 'woocommerce_coupon_shortcodes_blocks_init' ), 11 );
		if ( function_exists( 'get_default_block_categories' ) ) {
			add_filter( 'block_categories_all', array( __CLASS__, 'block_categories_all' ), 10, 2 );
		} else {
			add_filter( 'block_categories', array( __CLASS__, 'groups_block_categories' ), 10, 2 );
		}
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

		register_block_type(
			'woocommerce-coupon-shortcodes/coupon-is-active',
			array(
				'editor_script'   => 'woo-codes-blocks-block-js',
				//'editor_style'    => 'woo_codes_blocks-block-editor-css',
				//'style'           => 'woo_codes_blocks-style-css',
				//'render_callback' => array( __CLASS__, 'coupon_is_active_render_content' ),
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

	public static function groups_block_categories( $categories, $post ) {
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
		return $content;
	}

} WooCommerce_Coupon_Shortcodes_Blocks::init();