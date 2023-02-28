let GEO_DATA;

$(() => {
	GEO_DATA = KRASNODAR_DATA;
	$('.btn-group').on('change', ({ target }) => {
		GEO_DATA = window[target.value];
	});
});

const init = (ym) => {
	const suggestView = new ym.SuggestView('suggest', {
		provider: {
			suggest: function (request, options) {
				return ymaps.suggest(GEO_DATA.metadata.name + ', ' + request);
			},
		},
	});
	const map = new ym.Map('map', {
		center: [30.264981955459618, 59.9567962610097],
		zoom: 9,
	});

	$('#button').bind('click', function (e) {
		geocode(ym);
	});

	const geocode = async (ym) => {
		let deliveryArea;
		// Забираем запрос из поля ввода.
		const request = $('#suggest').val();
		let error;
		let price;
		// Геокодируем введённые данные.
		const resultGeo = await ym.geocode(request);

		const geoObject = resultGeo.geoObjects.get(0);

		if (geoObject) {
			const addressType = geoObject.properties.get(
				'metaDataProperty.GeocoderMetaData.precision'
			);
			switch (addressType) {
				case 'exact':
					const deliveryAreas = ym.geoQuery(GEO_DATA).addToMap(map);

					console.log(deliveryAreas);
					deliveryArea = deliveryAreas
						.searchContaining(geoObject)
						.get(0);
					break;
				case 'number':
				case 'near':
				case 'range':
					error = 'Неточный адрес, требуется уточнение';
					break;
				case 'street':
					error = 'Неполный адрес, требуется уточнение';
					break;
				case 'other':
				default:
					error = 'Неточный адрес, требуется уточнение';
					break;
			}

			if (deliveryArea) {
				price = deliveryArea.properties.get('description');
			} else if (!error) {
				error = 'По данному адресу не доставляем';
			}
		} else {
			error = 'Адрес не найден';
		}

		if (error) {
			$('#info').css({ display: 'none' });
			$('#error').css({ display: 'block' });
			$('#error').text(error);
		} else {
			$('#info').css({ display: 'block' });
			$('#info').text(`Стоимость доставки: ${price}`);
			$('#error').css({ display: 'none' });
		}
	};
};

ymaps.ready(init);

// function init() {
// 	// Подключаем поисковые подсказки к полю ввода.
// 	var suggestView = new ymaps.SuggestView('suggest'),
// 		map = new ymaps.Map('map', {
// 			center: [55.7, 37.6],
// 			zoom: 10,
// 		}),
// 		placemark;

// 	// При клике по кнопке запускаем верификацию введёных данных.
// 	$('#button').bind('click', function (e) {
// 		geocode();
// 	});

// 	function geocode() {
// 		// Забираем запрос из поля ввода.
// 		var request = $('#suggest').val();
// 		// Геокодируем введённые данные.
// 		ymaps.geocode(request).then(
// 			function (res) {
// 				var obj = res.geoObjects.get(0),
// 					error,
// 					hint;

// 				try {
// 					if (obj) {
// 						console.log('FF');
// 						const a = ymaps.geoQuery(GEO_DATA).addToMap(map);

// 						const b = a.searchContaining(obj);
// 						console.log(b);

// 						// Об оценке точности ответа геокодера можно прочитать тут: https://tech.yandex.ru/maps/doc/geocoder/desc/reference/precision-docpage/
// 						switch (
// 							obj.properties.get(
// 								'metaDataProperty.GeocoderMetaData.precision'
// 							)
// 						) {
// 							case 'exact':
// 								break;
// 							case 'number':
// 							case 'near':
// 							case 'range':
// 								error = 'Неточный адрес, требуется уточнение';
// 								hint = 'Уточните номер дома';
// 								break;
// 							case 'street':
// 								error = 'Неполный адрес, требуется уточнение';
// 								hint = 'Уточните номер дома';
// 								break;
// 							case 'other':
// 							default:
// 								error = 'Неточный адрес, требуется уточнение';
// 								hint = 'Уточните адрес';
// 						}
// 					} else {
// 						error = 'Адрес не найден';
// 						hint = 'Уточните адрес';
// 					}

// 					// Если геокодер возвращает пустой массив или неточный результат, то показываем ошибку.
// 					if (error) {
// 						showError(error);
// 						showMessage(hint);
// 					} else {
// 						showResult(obj);
// 					}
// 				} catch (e) {
// 					console.log(e);
// 				}
// 			},
// 			function (e) {
// 				console.log(e);
// 			}
// 		);
// 	}
// 	function showResult(obj) {
// 		// Удаляем сообщение об ошибке, если найденный адрес совпадает с поисковым запросом.
// 		$('#suggest').removeClass('input_error');
// 		$('#notice').css('display', 'none');

// 		var mapContainer = $('#map'),
// 			bounds = obj.properties.get('boundedBy'),
// 			// Рассчитываем видимую область для текущего положения пользователя.
// 			mapState = ymaps.util.bounds.getCenterAndZoom(bounds, [
// 				mapContainer.width(),
// 				mapContainer.height(),
// 			]),
// 			// Сохраняем полный адрес для сообщения под картой.
// 			address = [obj.getCountry(), obj.getAddressLine()].join(', '),
// 			// Сохраняем укороченный адрес для подписи метки.
// 			shortAddress = [
// 				obj.getThoroughfare(),
// 				obj.getPremiseNumber(),
// 				obj.getPremise(),
// 			].join(' ');
// 		// Убираем контролы с карты.
// 		mapState.controls = [];
// 		// Создаём карту.
// 		createMap(mapState, shortAddress);
// 		// Выводим сообщение под картой.
// 		showMessage(address);
// 	}

// 	function showError(message) {
// 		$('#notice').text(message);
// 		$('#suggest').addClass('input_error');
// 		$('#notice').css('display', 'block');
// 		// Удаляем карту.
// 		// if (map) {
// 		// 	map.destroy();
// 		// 	map = null;
// 		// }
// 	}

// 	function createMap(state, caption) {
// 		// Если карта еще не была создана, то создадим ее и добавим метку с адресом.
// 		if (!map) {
// 			map = new ymaps.Map('map', state);
// 			placemark = new ymaps.Placemark(
// 				map.getCenter(),
// 				{
// 					iconCaption: caption,
// 					balloonContent: caption,
// 				},
// 				{
// 					preset: 'islands#redDotIconWithCaption',
// 				}
// 			);
// 			map.geoObjects.add(placemark);
// 			// Если карта есть, то выставляем новый центр карты и меняем данные и позицию метки в соответствии с найденным адресом.
// 		} else {
// 			map.setCenter(state.center, state.zoom);
// 			placemark.geometry.setCoordinates(state.center);
// 			placemark.properties.set({
// 				iconCaption: caption,
// 				balloonContent: caption,
// 			});
// 		}
// 	}

// 	function showMessage(message) {
// 		$('#messageHeader').text('Данные получены:');
// 		$('#message').text(message);
// 	}
// }
