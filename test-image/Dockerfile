FROM gcr.io/city-7337/base

COPY run_unit_tests.sh run_unit_tests.sh
RUN chmod a+x run_unit_tests.sh
RUN git clone git@github.com:reflective-dk/reflective-api.git reflective-api
RUN cd reflective-api && npm i

EXPOSE 8080

CMD ["npm", "test"]