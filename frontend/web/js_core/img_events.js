(function() {
    /**
     * Атрибут редактируемого элемента
     */
    const CURRENT_EDIT = 'currentEditable';

    let oldSection = '.html-list-section';

    /**
     * Атрибут для получения текущего редактируемого элемента
     */
    const CURRENT_EDIT_ELEMENT = `[${CURRENT_EDIT}="true"]`;

    const renderHtml = (html) => {
        html = JSON.parse(html);
        $('.main-svg').empty();
        $('.main-svg').append(html);
        //if (draggable) draggable.target = ""

        let imgWidth = parseInt($('.main-svg').css('width'));
        let canvasWidth = parseInt($('.container .h-100').css('width'));
        let bottomMenuHeight = parseInt($('.menu-bottom').css('height'));

        console.log("Img width: " + imgWidth);
        console.log("Canvas width: " + canvasWidth);
        console.log("Menu width: " + bottomMenuHeight);

        if (imgWidth < canvasWidth) {
            let scale = Math.round(canvasWidth * 90 / imgWidth);
            $('.scale').val(scale);
            $('.main-svg').css('transform', `scale(${scale / 100})`);
        } else {
            let scale = Math.round(canvasWidth * 90 / imgWidth);
            $('.scale').val(scale);
            $('.main-svg').css('transform', `scale(${scale / 100})`);
        }

        $('[data-set="true"]').click((event) => {
            let clickCounter = +$(event.target).attr('clickCounter');
            if (clickCounter == 1) return;

            editableHandler(event);
        });
        $('[data-set="true"]').click(getToolsPanel);
        $('.draggable').css('cursor', 'move');

        $('[data-type="text"]').css('line-height', 'normal');
        $('[data-type="text"]').attr('clickCounter', 0);

        $('[data-type="text"]').click((event) => {
            let clickCounter = +$(event.target).attr('clickCounter');

            if (clickCounter == 1) {
                draggable.draggable = false;
                draggable.snappable = false;
                $(event.target).css('cursor', 'text');
            } else {
                clickCounter++;
                $(event.target).attr('clickCounter', clickCounter);
            }
        });

        /*
        $('[data-type="text"]').dblclick((event) => {
            if ($(event.target).attr('data-dblclick')) return;

            draggable.draggable = false;
            draggable.snappable = false;
            $('.draggable').css('cursor', 'text');

            $(event.target).attr('data-dblclick', 'true');
        });
        */

        $('[data-type="text"]').blur((event) => {
            let clickCounter = +$(event.target).attr('clickCounter');

            if (clickCounter == 1) {
                draggable.draggable = true;
                draggable.snappable = true;
                $(event.target).css('cursor', 'move');
                $(event.target).attr('clickCounter', 0);
            }
        });

        $('.main-svg').contextmenu((event) => {
            $('.contextmenu').css('display', 'inline-block');
            $('.contextmenu').css('left', event.pageX);
            $('.contextmenu').css('top', event.pageY);
            return false;
        });

        $(window).click((event) => {
            $('.contextmenu').hide();
        })
    }

    $('.content-block').click((event) => {
        if (!event) return;

        let element = $(event.target);

        while (element.prop('tagName') != 'DIV') {
            element = element.parent();
        }

        if (element.attr('data-list') == '1') {
            $.ajax({
                type: 'GET',
                url: 'img/list',
                data: {
                    id: element.attr('data-id')
                },
                success: (html) => {
                    html = JSON.parse(html);
                    $('.category-section').hide();
                    $('.html-list-container').empty();
                    $('.html-list-section').show();

                    $('.html-list-container').append(`
                        <img src="${element.find('img').attr('src')}" class="node" data-node="${element.attr('data-id')}" style="maring-top: 10px; cursor: pointer;">
                    `);

                    html.forEach(img => {
                        $('.html-list-container').append(`
                            <img src="${img.src}" class="node" data-node="${img.node}" style="maring-top: 10px; cursor: pointer;">
                        `)
                    });

                    $('.node').click((event) => {
                        $.ajax({
                            type: 'GET',
                            url: 'img/html',
                            data: {
                                id: $(event.target).attr('data-node')
                            },
                            success: (html) => {
                                renderHtml(html);
                            }
                        })
                    })
                }
            });
        }

        $.ajax({
            type: 'GET',
            url: 'img/html',
            data: {
                id: element.attr('data-id')
            },
            success: (html) => {
                renderHtml(html);

                if (element.attr('data-list') == '0') {
                    $('aside').removeClass('sidebar--is-visible');
                }
            }
        })
    });

    $('.fonts').click((event) => {
        if ($('.category-section:visible').get(0)) {
            oldSection = '.category-section';
        }
        if ($('.html-list-section:visible').get(0)) {
            oldSection = '.html-list-section';
        }

        if ($('.font-section:visible').get(0)) {
            $('.font-section').hide();
            $(oldSection).show();
            return;
        }


        $('.category-section').hide();
        $('.html-list-section').hide();
        $('.font-section').show();

        $.ajax({
            type: 'GET',
            url: '/img/font',
            data: {
                pivot: 0
            },
            success: (html) => {
                html = JSON.parse(html);

                html.filter((font) => {
                    $('.fonts-list').append(`
                    <button data-src="${font.src}" type="button" class="list-group-item list-group-item-action">${font.title}</button>
                    `);
                })

                $('.fonts-list').click((event) => {
                    if (event.target.tagName != 'BUTTON') return;

                    let pathToFont = $(event.target).attr('data-src');
                    let title = $(event.target).html();

                    $('.main-svg').children().first().prepend(`
                        <style class="fonts-style">
                            @font-face {
                                font-family: ${title};
                                src: url(http://color.ajoin.ru/${pathToFont}) format('truetype');
                                font-weight: normal;
                                font-style: normal;
                            }
                        </style>
                    `);

                    $(CURRENT_EDIT_ELEMENT).css('font-family', title);
                    updateCurrentFont();
                    draggable.updateRect();
                    draggable.updateTarget();
                });
            }
        });

    });

    $('.category-button').click((event) => {
        $('.fonts-list').empty();

        if ($('.html-list-section:visible').get(0)) {
            $('.html-list-section').hide();
            $('.category-section').show();
            return;
        }

        if ($('.font-section:visible').get(0) && oldSection == '.html-list-section') {
            $('.font-section').hide();
            $('.html-list-section').show();
            return;
        }

        $('.font-section').hide();
        $('.html-list-section').hide();
        $('.category-section').show();
    });

    $('.format-button').click((event) => {
        $('.font-container').addClass('collapse');
        $('.font-container').removeClass('show');
    });
})();

$('.update-html').click((event) => {
    $.ajax({
        type: 'POST',
        url: '/admin/update',
        data: {
            id: $('.html-id').html(),
            content: editor.getValue()
        },
        success: (html) => {
            html = JSON.parse(html);

            if (html.status == 'success') {
                $('.alert-update').fadeIn(300);
            }
        }
    })
})

$('.delete-template').click((event) => {
    $(event.target).next().fadeIn(300);
});

$('.delete-true').click((event) => {
    $.ajax({
        type: 'POST',
        url: $(event.target).attr('data-url'),
        data: {
            id: $(event.target).attr('data-id')
        },
        success: (html) => {
            $(event.target).parent().parent().parent().parent().fadeOut(300);
        }
    })
})

$('.delete-false').click((event) => {
    $(event.target).parent().fadeOut(300);
});

jQuery.fn.swapWith = function(to) {
    return this.each(function() {
        var copy_to = $(to).clone(true);
        var copy_from = $(this).clone(true);
        $(to).replaceWith(copy_from);
        $(this).replaceWith(copy_to);
    });
};

$('.to-top').click((event) => {
    let showOne = $(event.target).parent().parent().parent();
    let showTwo = $(event.target).parent().parent().parent().prev();

    if (!showTwo.get(0)) return;

    $.ajax({
        type: 'GET',
        url: '/admin/swap',
        data: {
            'show_one': showOne.attr('data-id'),
            'show_two': showTwo.attr('data-id')
        },
        success: (html) => {
            showTwo.swapWith(showOne);
        }
    });
});

$('.to-bottom').click((event) => {
    let showOne = $(event.target).parent().parent().parent();
    let showTwo = $(event.target).parent().parent().parent().next();

    if (!showTwo.get(0)) return;

    $.ajax({
        type: 'GET',
        url: '/admin/swap',
        data: {
            'show_one': showOne.attr('data-id'),
            'show_two': showTwo.attr('data-id')
        },
        success: (html) => {
            showTwo.swapWith(showOne);
        }
    });
});