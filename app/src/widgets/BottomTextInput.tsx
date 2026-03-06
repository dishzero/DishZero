/*eslint-disable*/

import { faPaperPlane, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { Button, Container, InputGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useLocation } from 'react-router-dom';

const BottomTextInput = (props) => {
    const [input, setInput] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await props.onSubmit(props.value);
        return false;
    };
    return (
        <div className="start-50 position-fixed bottom-0 p-2 translate-middle" style={{ width: '95%' }}>
            <div>
                <Form onSubmit={handleSubmit}>
                    <InputGroup className="mb-1 qr-search-container shadow-sm">
                        <InputGroup.Text className="search-icon">
                            <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>

                        <Form.Control
                            className="search-bar"
                            value={props.value}
                            onChange={props.onChange}
                            type="text"
                            placeholder="Enter dish id #"
                        />

                        <Button
                            variant="outline-secondary"
                            id="button-addon2"
                            onSubmit={handleSubmit}
                            type="submit"
                            disabled={props.disabled}
                            className="search-button"
                            data-testid="return-btn">
                            <FontAwesomeIcon icon={faPaperPlane} fontSize={'1.4em'} />
                        </Button>
                    </InputGroup>
                </Form>
            </div>
        </div>
    );
};

export default BottomTextInput;
