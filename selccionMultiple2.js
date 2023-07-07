import * as THREE from 'three';

			import Stats from 'three/addons/libs/stats.module.js';

			import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox.js';
            import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper.js';

            const camera = viewer.context.ifcCamera.cameraControls;
            const scene =viewer.context.scene.scene;
            renderer=viewer.context.renderer;
			const selectionBox = new SelectionBox( camera, scene );
			const helper = new SelectionHelper( renderer, 'selectBox' );

			document.addEventListener( 'pointerdown', function ( event ) {

				for ( const item of selectionBox.collection ) {

					item.material.emissive.set( 0x000000 );

				}

				selectionBox.startPoint.set(
					( event.clientX / window.innerWidth ) * 2 - 1,
					- ( event.clientY / window.innerHeight ) * 2 + 1,
					0.5 );

			} );

			document.addEventListener( 'pointermove', function ( event ) {

				if ( helper.isDown ) {

					for ( let i = 0; i < selectionBox.collection.length; i ++ ) {

						selectionBox.collection[ i ].material.emissive.set( 0x000000 );

					}

					selectionBox.endPoint.set(
						( event.clientX / window.innerWidth ) * 2 - 1,
						- ( event.clientY / window.innerHeight ) * 2 + 1,
						0.5 );

					const allSelected = selectionBox.select();

					for ( let i = 0; i < allSelected.length; i ++ ) {

						allSelected[ i ].material.emissive.set( 0xffffff );

					}

				}

			} );

			document.addEventListener( 'pointerup', function ( event ) {

				selectionBox.endPoint.set(
					( event.clientX / window.innerWidth ) * 2 - 1,
					- ( event.clientY / window.innerHeight ) * 2 + 1,
					0.5 );

				const allSelected = selectionBox.select();

				for ( let i = 0; i < allSelected.length; i ++ ) {

					allSelected[ i ].material.emissive.set( 0xffffff );

				}

			} );

		