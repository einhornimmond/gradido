#include "Obfus_array.h"
#include <sodium.h>
#include <memory.h>
#include <math.h>

ObfusArray::ObfusArray(size_t size, const unsigned char * data)
	: m_arraySize(0), m_offsetSize(0), m_dataSize(size), m_Data(nullptr)
{
	m_arraySize = size + randombytes_random() % (int)roundf(size*0.25f);
	m_Data = (unsigned char*)malloc(m_arraySize);
	m_offsetSize = randombytes_random() % (int)roundf((m_arraySize - m_dataSize) * 0.8f);

	uint32_t* d = (uint32_t*)m_Data;

	for (size_t i = 0; i < (size_t)floorf(m_arraySize / 4.0f); i++) {
		d[i] = randombytes_random();
	}
	d[m_arraySize - 4] = randombytes_random();

	memcpy(&m_Data[m_offsetSize], data, size);
}

ObfusArray::~ObfusArray()
{
	if (m_Data) {
		free(m_Data);
	}
}